// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 8cdc8747-307a-45fc-b880-dbb6c55de8dc
// Created: 2026
// COMPONENT: Product operation tests
// PURPOSE: Verify local extension contracts without claiming a Markdown implementation.
// RELATES: specs/product-adapter.md
// FLOW: Create synthetic source -> execute local adapter -> verify artifact or safe failure.

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { productFixture } from './product-fixture.ts';
import { productOperation } from '../product-operation.ts';
import { readSourceState } from '../source.ts';
import { run } from '../process.ts';

vi.mock('../process.ts', () => ({ run: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../source.ts', () => ({ readSourceState: vi.fn().mockResolvedValue({
    commit: 'c'.repeat(40), dirty: true,
}) }));
let root: string;
beforeEach(async () =>
{
    vi.clearAllMocks();
    root = await mkdtemp(join(tmpdir(), 'outcrop operation '));
    await productFixture(root);
    await writeFile(join(root, 'package.json'), JSON.stringify({ version: '9.0.0' }));
    await writeFile(join(root, 'package-lock.json'), JSON.stringify({ packages: {} }));
    vi.spyOn(console, 'log').mockImplementation(() =>
    {});
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
    vi.restoreAllMocks();
});
const selection = { extension: 'sample', environment: 'dev' as const, help: false, fixture: false };
it('builds the selected source with its own version and actual source identity', async () =>
{
    await productOperation(root, { ...selection, operation: 'build' });
    const [output] = (await readdir(join(root, 'build'))).filter(name => name.startsWith('sample-'));
    expect(JSON.parse(await readFile(join(root, 'build', output!, 'build-info.json'), 'utf8')))
        .toMatchObject({ version: expect.stringMatching(/^0\.7\.2-dev\+/), commit: 'c'.repeat(40), dirty: true });
});
it('packages development output only after shared and product validation', async () =>
{
    await productOperation(root, { ...selection, operation: 'package' });
    expect(run).toHaveBeenCalledWith('npm', ['run', 'test:instructions'], root);
    expect(vi.mocked(run).mock.calls.some(call => call[1].includes('--coverage.thresholds.lines=90'))).toBe(true);
    expect((await readdir(join(root, 'dist'))).some(name => name.startsWith('sample-0.7.2-dev+'))).toBe(true);
});
it('stops before reading source identity or building when product validation fails', async () =>
{
    vi.mocked(run).mockRejectedValueOnce(new Error('check failed'));
    await expect(productOperation(root, { ...selection, operation: 'package' })).rejects.toThrow('check failed');
    expect(readSourceState).not.toHaveBeenCalled();
    expect(await readdir(root)).not.toContain('build');
});
it('runs selected product checks without producing a package', async () =>
{
    await productOperation(root, { ...selection, operation: 'test' });
    expect(vi.mocked(run).mock.calls.some(call => call[1].includes('--coverage'))).toBe(true);
    expect(await readdir(root)).not.toContain('dist');
});
it('keeps production guarded even for configured product sources', async () =>
{
    await expect(productOperation(root, { ...selection, operation: 'build', environment: 'prod' }))
        .rejects.toThrow(/RELEASE_NOT_READY/);
    expect(await readdir(root)).not.toContain('build');
});
