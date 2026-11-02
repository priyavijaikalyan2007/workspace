// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 77d00d13-f5e9-4bc4-985f-6e385f2ca34c
// Created: 2026
// COMPONENT: Native workspace tooling tests
// PURPOSE: Verify contracts before implementing the local command pipeline.
// RELATES: specs/tooling-implementation.md
// FLOW: Arrange controlled inputs -> execute -> assert outcomes.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, writeFile, mkdir, symlink, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { claimOutput, cleanOutput } from '../files.ts';
import { buildFixture } from '../build.ts';
import { packageArtifact } from '../package.ts';
import { createBuildInfo } from '../version.ts';

let root: string;
const project = process.cwd();
const info = createBuildInfo({
    version: '0.1.0', commit: 'b'.repeat(40), dirty: true,
    clock: new Date('2026-11-01T14:30:00Z'), environment: 'dev',
});

beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop tooling '));
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});

describe('owned generated output', () =>
{
    it('cleans an explicitly owned output', async () =>
    {
        await claimOutput(root, 'build');
        await cleanOutput(root, 'build');
        expect(await readdir(root)).toEqual([]);
    });
    it('preserves unowned files', async () =>
    {
        await mkdir(join(root, 'build'));
        await writeFile(join(root, 'build', 'valuable'), 'keep');
        await expect(cleanOutput(root, 'build')).rejects.toThrow(/unowned/i);
    });
    it('rejects traversal', async () =>
    {
        await expect(claimOutput(root, '../escape')).rejects.toThrow();
    });
    it('rejects a symlinked output', async () =>
    {
        await mkdir(join(root, 'actual'));
        await symlink(join(root, 'actual'), join(root, 'build'));
        await expect(claimOutput(root, 'build')).rejects.toThrow(/symlink/i);
    });
    it('allows cleaning absent output', async () =>
    {
        await expect(cleanOutput(root, 'build')).resolves.toBeUndefined();
    });
});

describe('isolated Apps Script fixture', () =>
{
    it('preserves a callable global callback and embedded identity', async () =>
    {
        const output = await buildFixture(project, root, info);
        const code = await readFile(join(output, 'apps-script', 'Code.gs'), 'utf8');
        const context: { fixtureInfo?: () => unknown } = {};
        runInNewContext(code, context);
        expect(context.fixtureInfo?.()).toEqual(info);
    });
    it('includes only runtime files in the upload directory', async () =>
    {
        const output = await buildFixture(project, root, info);
        expect((await readdir(join(output, 'apps-script'))).sort())
            .toEqual(['Code.gs', 'Index.html', 'appsscript.json']);
    });
    it('embeds the same identity in browser output', async () =>
    {
        const output = await buildFixture(project, root, info);
        const html = await readFile(join(output, 'apps-script', 'Index.html'), 'utf8');
        expect(html).toContain(info.version);
    });
    it('stops packaging after a validation failure', async () =>
    {
        const validate = vi.fn().mockRejectedValue(new Error('check failed'));
        await expect(packageArtifact(root, join(root, 'missing'), 'fixture', validate)).rejects.toThrow('check failed');
        expect(await readdir(root)).toEqual([]);
    });
    it('writes a verifiable package manifest', async () =>
    {
        const output = await buildFixture(project, root, info);
        const result = await packageArtifact(root, output, 'fixture', async () =>
        {});
        const manifest = JSON.parse(await readFile(join(result, 'manifest.json'), 'utf8'));
        expect(manifest.files['apps-script/Code.gs']).toMatch(/^[a-f0-9]{64}$/);
    });
    it('refuses to overwrite an existing package', async () =>
    {
        const output = await buildFixture(project, root, info);
        await packageArtifact(root, output, 'fixture', async () =>
        {});
        await expect(packageArtifact(root, output, 'fixture', async () =>
        {})).rejects.toThrow(/exists/i);
    });
    it('rejects a malformed Apps Script manifest', async () =>
    {
        const output = await buildFixture(project, root, info);
        await writeFile(join(output, 'apps-script', 'appsscript.json'), '{broken');
        await expect(packageArtifact(root, output, 'fixture', async () =>
        {})).rejects.toThrow(/manifest/i);
    });
    it('rejects development files added to runtime output', async () =>
    {
        const output = await buildFixture(project, root, info);
        await writeFile(join(output, 'apps-script', 'test.ts'), 'not runtime');
        await expect(packageArtifact(root, output, 'fixture', async () =>
        {})).rejects.toThrow(/runtime/i);
    });
});
