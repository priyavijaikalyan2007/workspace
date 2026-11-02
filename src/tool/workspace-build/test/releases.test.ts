// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 221bb4e4-274c-4577-bd3a-c7b3a841099e
// Created: 2026
// COMPONENT: Release persistence tests
// PURPOSE: Verify release integrity using real temporary Git and filesystem state.
// RELATES: specs/release-implementation.md
// FLOW: Arrange isolated source -> attempt release operation -> verify durable state.

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createCandidate, failCandidate, confirmProduction } from '../release.ts';
import { readLedger, withLedger } from '../release-store.ts';
import { currentProduction } from '../release-state.ts';
import { formatDiagnostics } from '../diagnostics.ts';
import type { BuildInfo } from '../version.ts';
import type { ReleaseEvent } from '../release-event.ts';

let root: string;
const target = { projectId: 'outcrop-sample-prod', scriptId: 'A'.repeat(48) };

function git(...args: string[]): string
{
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function commit(): void
{
    git('add', '.');
    git('-c', 'user.name=Release tests', '-c', 'user.email=tests@example.invalid', 'commit', '-qm', 'Source state');
}

beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop release '));
    await mkdir(join(root, 'src/extensions/googleworkspace/sample'), { recursive: true });
    await writeFile(join(root, 'workspace.config.json'), JSON.stringify({ schemaVersion: 1,
        extensions: [{ name: 'sample', path: 'src/extensions/googleworkspace/sample', state: 'ready' }] }));
    await writeFile(join(root, 'src/extensions/googleworkspace/sample/package.json'), '{"version":"1.0.0"}');
    await writeFile(join(root, '.gitignore'), 'dist/\nreleases/.locks/\nreleases/.release-tmp-*\n');
    git('init', '-q');
    commit();
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});

async function build(info: BuildInfo): Promise<string>
{
    const output = join(root, 'dist', info.version);
    await mkdir(join(output, 'apps-script'), { recursive: true });
    const files: Record<string, string> = {};
    for (const [file, content] of Object.entries({
        'build-info.json': JSON.stringify(info), 'apps-script/Code.gs': JSON.stringify(info),
        'apps-script/Index.html': JSON.stringify(info), 'apps-script/appsscript.json': '{"runtimeVersion":"V8"}',
    }))
    {
        await writeFile(join(output, file), content);
        files[file] = createHash('sha256').update(content).digest('hex');
    }
    await writeFile(join(output, 'manifest.json'), JSON.stringify({ schemaVersion: 1, extension: 'sample',
        environment: 'prod', files }));
    return output;
}

async function candidate(buildNumber = 'ci.1'): Promise<ReleaseEvent>
{
    return await createCandidate(root, 'sample', '1.0.0', build, { buildNumber });
}

async function verify(event: ReleaseEvent)
{
    if (event.kind !== 'candidate')
    {
        throw new Error('Test requires a candidate');
    }
    return { ...target, version: event.info.version, commit: event.info.commit, digest: event.digest,
        scriptVersion: 1, publicationVerified: true, observedAt: new Date().toISOString() };
}

describe('durable candidates', () =>
{
    it('records clean source identity and the same metadata passed into the build', async () =>
    {
        const source = git('rev-parse', 'HEAD');
        const event = await candidate();
        expect(event).toMatchObject({ kind: 'candidate', info: { commit: source, dirty: false,
            environment: 'prod', version: `1.0.0+ci.1.g${source.slice(0, 7)}`, releaseSequence: 1 } });
    });
    it('persists the complete event for another process', async () =>
    {
        const event = await candidate();
        expect(await readLedger(root, 'sample')).toEqual([event]);
    });
    it('rejects dirty source before invoking a builder', async () =>
    {
        await writeFile(join(root, 'uncommitted'), 'change');
        const builder = vi.fn();
        await expect(createCandidate(root, 'sample', '1.0.0', builder)).rejects.toThrow(/clean/i);
        expect(builder).not.toHaveBeenCalled();
    });
    it('requires an explicit version matching the checked-in package', async () =>
    {
        await expect(createCandidate(root, 'sample', '1.0.1', build)).rejects.toThrow(/package version/i);
    });
    it('does not create a candidate after a failed build', async () =>
    {
        await expect(createCandidate(root, 'sample', '1.0.0', async () =>
        {
            throw new Error('build failed');
        }))
            .rejects.toThrow('build failed');
        expect(await readLedger(root, 'sample')).toEqual([]);
    });
    it('rejects concurrent writers instead of overwriting history', async () =>
    {
        await withLedger(root, 'sample', async () =>
        {
            await expect(withLedger(root, 'sample', async events => events)).rejects.toThrow(/lock/i);
            return [];
        });
    });
    it('requires an active candidate to resolve before another reservation', async () =>
    {
        await candidate();
        commit();
        await expect(candidate('ci.2')).rejects.toThrow(/active candidate/i);
    });
    it('allocates a new sequence after a failed candidate without reusing its full identity', async () =>
    {
        const first = await candidate();
        await failCandidate(root, 'sample', first.id, 'HOST_TEST_FAILED');
        commit();
        expect(await candidate('ci.2')).toMatchObject({ info: { releaseSequence: 2 } });
    });
    it('rejects a changed package file after its hash was recorded', async () =>
    {
        const builder = async (info: BuildInfo) =>
        {
            const output = await build(info);
            await writeFile(join(output, 'apps-script/Code.gs'), 'tampered');
            return output;
        };
        await expect(createCandidate(root, 'sample', '1.0.0', builder)).rejects.toThrow(/hash/i);
    });
    it('rejects a fixture package for production', async () =>
    {
        const builder = async (info: BuildInfo) =>
        {
            const output = await build(info);
            await writeFile(join(output, 'manifest.json'), '{"fixture":true}');
            return output;
        };
        await expect(createCandidate(root, 'sample', '1.0.0', builder)).rejects.toThrow(/manifest/i);
    });
    it('rejects mismatched embedded identity', async () =>
    {
        const builder = async (info: BuildInfo) =>
        {
            const output = await build(info);
            await writeFile(join(output, 'build-info.json'), '{}');
            return output;
        };
        await expect(createCandidate(root, 'sample', '1.0.0', builder)).rejects.toThrow();
    });
    it('rejects source traversal before reading or writing', async () =>
    {
        await expect(readLedger(root, '../other')).rejects.toThrow();
    });
    it('rejects symlinked release directories', async () =>
    {
        await symlink(root, join(root, 'releases'));
        await expect(candidate()).rejects.toThrow(/symlink/i);
    });
    it('preserves corrupt history instead of replacing it with empty history', async () =>
    {
        await mkdir(join(root, 'releases'));
        await writeFile(join(root, 'releases/sample.json'), '{bad');
        await expect(readLedger(root, 'sample')).rejects.toThrow();
        expect(await readFile(join(root, 'releases/sample.json'), 'utf8')).toBe('{bad');
    });
});

describe('verified production state', () =>
{
    it('preserves candidate history when verification fails', async () =>
    {
        const event = await candidate();
        await expect(confirmProduction(root, 'sample', event.id, async () =>
        {
            throw new Error('host unavailable');
        },
        { target })).rejects.toThrow('host unavailable');
        expect(await readLedger(root, 'sample')).toEqual([event]);
    });
    it('marks production only after matching remote observation', async () =>
    {
        const event = await candidate();
        await confirmProduction(root, 'sample', event.id, verify, { target });
        expect((await readLedger(root, 'sample')).map(item => item.kind)).toEqual(['candidate', 'production']);
    });
    it.each([
        { publicationVerified: false }, { commit: 'c'.repeat(40) }, { version: '9.9.9' },
        { projectId: 'different-project' }, { digest: 'd'.repeat(64) }, { scriptVersion: 0 },
        { observedAt: '2020-01-01T00:00:00.000Z' },
    ])('rejects mismatched observation %j', async (change) =>
    {
        const event = await candidate();
        await expect(confirmProduction(root, 'sample', event.id, async value => ({ ...await verify(value), ...change }),
            { target })).rejects.toThrow();
    });
    it('rejects rollback to an artifact never verified in production', async () =>
    {
        const event = await candidate();
        await expect(confirmProduction(root, 'sample', event.id, verify, { target, rollback: true }))
            .rejects.toThrow(/production/i);
    });
    it('does not allow a failure to erase a verified production event', async () =>
    {
        const event = await candidate();
        await confirmProduction(root, 'sample', event.id, verify, { target });
        await expect(failCandidate(root, 'sample', event.id, 'FAILED')).rejects.toThrow();
    });
    it('does not accept private free text as a failure reason', async () =>
    {
        const event = await candidate();
        await expect(failCandidate(root, 'sample', event.id, 'document contents are private')).rejects.toThrow();
    });
});

describe('safe embedded diagnostics', () =>
{
    it('copies the full running identity and excludes extra caller data', async () =>
    {
        const event = await candidate();
        if (event.kind !== 'candidate')
        {
            throw new Error('Expected candidate');
        }
        const info = { ...event.info, token: 'secret-token', document: 'private-document', home: '/Users/private' };
        const diagnostics = formatDiagnostics('sample', info);
        expect(diagnostics).toContain(event.info.version);
        expect(diagnostics).not.toMatch(/secret-token|private-document|Users/);
        expect(diagnostics).toContain('UTC');
    });
});

describe('version advances and rollback', () =>
{
    async function publishFirst(): Promise<ReleaseEvent>
    {
        const event = await candidate();
        await confirmProduction(root, 'sample', event.id, verify, { target });
        commit();
        return event;
    }
    async function version(value: string): Promise<void>
    {
        const path = join(root, 'src/extensions/googleworkspace/sample/package.json');
        await writeFile(path, JSON.stringify({ version: value }));
        commit();
    }
    it.each(['1.0.0', '1.1.1', '2.1.0', '2.0.1'])('rejects a reused core or missing resets: %s', async (value) =>
    {
        await publishFirst();
        if (value !== '1.0.0')
        {
            await version(value);
        }
        await expect(createCandidate(root, 'sample', value, build, { buildNumber: 'ci.2' }))
            .rejects.toThrow(/core|reset/i);
    });
    it('rolls back to the original identity without rebuilding or allocating another sequence', async () =>
    {
        const first = await publishFirst();
        await version('1.1.0');
        const second = await createCandidate(root, 'sample', '1.1.0', build, { buildNumber: 'ci.2' });
        await confirmProduction(root, 'sample', second.id, verify, { target });
        await confirmProduction(root, 'sample', first.id, verify, { target, rollback: true });
        const events = await readLedger(root, 'sample');
        expect(currentProduction(events)).toBe(first.id);
        expect(events[0]).toEqual(first);
        expect(events.filter(event => event.kind === 'candidate')).toHaveLength(2);
    });
    it('retains the highest published core after a rollback', async () =>
    {
        const first = await publishFirst();
        await version('1.1.0');
        const second = await createCandidate(root, 'sample', '1.1.0', build, { buildNumber: 'ci.2' });
        await confirmProduction(root, 'sample', second.id, verify, { target });
        await confirmProduction(root, 'sample', first.id, verify, { target, rollback: true });
        await version('1.0.1');
        await expect(createCandidate(root, 'sample', '1.0.1', build, { buildNumber: 'ci.3' }))
            .rejects.toThrow(/core|reset/i);
    });
    it('rejects a builder that changes source during packaging', async () =>
    {
        const builder = async (info: BuildInfo) =>
        {
            const result = await build(info);
            await writeFile(join(root, 'changed-source'), 'uncommitted');
            return result;
        };
        await expect(createCandidate(root, 'sample', '1.0.0', builder)).rejects.toThrow(/Source changed/);
    });
});

it('prevents a storage callback from rewriting previously saved events', async () =>
{
    const original = await candidate();
    await expect(withLedger(root, 'sample', async events =>
        events.map(event => ({ ...event, at: '2026-01-01T00:00:00.000Z' })))).rejects.toThrow(/append|history/i);
    expect(await readLedger(root, 'sample')).toEqual([original]);
});
