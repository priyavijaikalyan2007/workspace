// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 5e932ba1-2982-4268-9ed6-8524078159dc
// Created: 2026
// COMPONENT: Product adapter tests
// PURPOSE: Verify local extension contracts without claiming a Markdown implementation.
// RELATES: specs/product-adapter.md
// FLOW: Create synthetic source -> execute local adapter -> verify artifact or safe failure.

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadProduct } from '../product-config.ts';
import { validateProduct } from '../product-validation.ts';
import { run } from '../process.ts';
import { productFixture } from './product-fixture.ts';

vi.mock('../process.ts', () => ({ run: vi.fn().mockResolvedValue(undefined) }));
let root: string;
beforeEach(async () =>
{
    vi.clearAllMocks();
    root = await mkdtemp(join(tmpdir(), 'outcrop validate '));
    await productFixture(root);
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});
it('runs isolated server types, lint, and product coverage independently from tooling', async () =>
{
    const product = await loadProduct(root, 'sample');
    await validateProduct(root, product);
    const calls = vi.mocked(run).mock.calls;
    expect(calls).toEqual(expect.arrayContaining([
        [process.execPath, expect.arrayContaining(['-p', 'docs/tsconfig.server.json']), product.directory],
        [process.execPath, expect.arrayContaining(['--coverage', '--coverage.thresholds.lines=90',
            '--coverage.thresholds.functions=90', '--coverage.thresholds.branches=80',
            '--coverage.include=docs/**/*.ts', '--coverage.include=shared/**/*.ts']), product.directory],
    ]));
    expect(calls.some(call => call[1].includes('docs/tsconfig.client.json'))).toBe(false);
});
it('adds isolated browser types only for explicit browser input', async () =>
{
    await productFixture(root, true);
    const product = await loadProduct(root, 'sample');
    await validateProduct(root, product);
    expect(run).toHaveBeenCalledWith(process.execPath,
        expect.arrayContaining(['-p', 'docs/tsconfig.client.json']), product.directory);
});
it('stops validation when a product prerequisite fails', async () =>
{
    vi.mocked(run).mockRejectedValueOnce(new Error('server type error'));
    await expect(validateProduct(root, await loadProduct(root, 'sample'))).rejects.toThrow('server type error');
    expect(run).toHaveBeenCalledOnce();
});
