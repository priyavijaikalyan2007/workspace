// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: abe5de48-72e6-41b4-b1be-362c0a34d143
// Created: 2026
// COMPONENT: Native workspace tooling tests
// PURPOSE: Verify contracts before implementing the local command pipeline.
// RELATES: specs/tooling-implementation.md
// FLOW: Arrange controlled inputs -> execute -> assert outcomes.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, writeFile, rm, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readExtensions, loadExtension } from '../config.ts';
import { run } from '../process.ts';
import { readSourceState } from '../source.ts';
import { buildTool } from '../build.ts';
import { rejectLink } from '../files.ts';
import { readBuildProperties } from '../properties.ts';
import { validateDependencies } from '../policy.ts';

let root: string;
beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop contract '));
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});

async function registry(value: unknown): Promise<void>
{
    await writeFile(join(root, 'workspace.config.json'), JSON.stringify(value));
}

describe('configuration boundaries', () =>
{
    it.each([{}, null, { schemaVersion: 2, extensions: [] }, { schemaVersion: 1, extensions: [null] },
        { schemaVersion: 1, extensions: [{ name: '../x', path: '/tmp', state: 'ready' }] }
    ])('rejects malformed registry %j', async (value) =>
    {
        await registry(value);
        await expect(readExtensions(root)).rejects.toThrow(/CONFIG/);
    });
    it('rejects duplicate identifiers', async () =>
    {
        const entry = { name: 'sample', path: 'src/extensions/googleworkspace/sample', state: 'ready' };
        await registry({ schemaVersion: 1, extensions: [entry, entry] });
        await expect(readExtensions(root)).rejects.toThrow(/Duplicate/);
    });
    it('returns a declared ready entry without inventing its implementation', async () =>
    {
        const entry = { name: 'sample', path: 'src/extensions/googleworkspace/sample', state: 'ready' };
        await registry({ schemaVersion: 1, extensions: [entry] });
        expect(await loadExtension(root, 'sample')).toEqual(entry);
    });
    it('rejects links in generated children', async () =>
    {
        await symlink(root, join(root, 'link'));
        await expect(rejectLink(join(root, 'link'))).rejects.toThrow(/symlink/);
    });
});

describe('process and source boundaries', () =>
{
    it('runs a command without shell argument expansion', async () =>
    {
        await expect(run(process.execPath, ['-e', 'process.exit(0)', '$(false)'], root)).resolves.toBeUndefined();
    });
    it('propagates nonzero exit status', async () =>
    {
        await expect(run(process.execPath, ['-e', 'process.exit(7)'], root)).rejects.toThrow(/7/);
    });
    it('propagates missing executable failure', async () =>
    {
        await expect(run(join(root, 'missing'), [], root)).rejects.toThrow();
    });
    it('reads actual Git commit and dirty state', async () =>
    {
        const state = await readSourceState(process.cwd());
        expect(state).toMatchObject({ commit: expect.stringMatching(/^[a-f0-9]{40}$/), dirty: expect.any(Boolean) });
    });
    it('builds the tooling independently from product sources', async () =>
    {
        await mkdir(join(root, 'src/tool/workspace-build'), { recursive: true });
        await writeFile(join(root, 'src/tool/workspace-build/cli.ts'), 'console.log("fixture tool");');
        expect(await buildTool(root)).toBe(join(root, 'build/tooling'));
    });
});

describe('dependency policy', () =>
{
    it('accepts the actual pinned dependency graph', async () =>
    {
        await expect(validateDependencies(process.cwd())).resolves.toBeUndefined();
    });
    it.each(['node_modules/react', 'node_modules/react-dom', 'node_modules/@types/react',
        'node_modules/@vitejs/plugin-react', 'node_modules/adapter-react'
    ])('rejects prohibited React dependency %s', async (name) =>
    {
        await writeFile(join(root, 'package-lock.json'), JSON.stringify({ packages: { [name]: {} } }));
        await expect(validateDependencies(root)).rejects.toThrow(/React/);
    });
});

describe('checked-in build properties', () =>
{
    it('uses the package version and checked-in build number property', async () =>
    {
        await writeFile(join(root, 'package.json'), JSON.stringify({ version: '0.2.0' }));
        await registry({ schemaVersion: 1, extensions: [], buildProperties: { buildNumber: 'property.3' } });
        expect(await readBuildProperties(root)).toEqual({ version: '0.2.0', buildProperty: 'property.3' });
    });
    it('rejects malformed properties rather than normalizing them', async () =>
    {
        await writeFile(join(root, 'package.json'), JSON.stringify({ version: 4 }));
        await registry({ schemaVersion: 1, extensions: [] });
        await expect(readBuildProperties(root)).rejects.toThrow(/PROPERTIES/);
    });
});
