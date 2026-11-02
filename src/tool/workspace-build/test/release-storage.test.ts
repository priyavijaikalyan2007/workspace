// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 4ce53f54-3da0-4374-b767-2d4410ac73cd
// Created: 2026
// COMPONENT: Release persistence tests
// PURPOSE: Verify release integrity using real temporary Git and filesystem state.
// RELATES: specs/release-implementation.md
// FLOW: Arrange isolated source -> attempt release operation -> verify durable state.

import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readLedger, withLedger } from '../release-store.ts';

vi.mock('node:crypto', async importOriginal =>
{
    const actual = await importOriginal<typeof import('node:crypto')>();
    return { ...actual, randomUUID: vi.fn(actual.randomUUID) };
});
let root: string;
beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop storage '));
    await mkdir(join(root, 'releases'));
});
afterEach(async () =>
{
    vi.mocked(randomUUID).mockRestore();
    await rm(root, { recursive: true, force: true });
});
it('preserves a pre-existing temporary file when exclusive creation fails', async () =>
{
    const id = '00000000-0000-4000-8000-000000000009';
    const path = join(root, 'releases', `.release-tmp-${id}`);
    await writeFile(path, 'preserve');
    vi.mocked(randomUUID).mockReturnValueOnce(id);
    await expect(withLedger(root, 'sample', async events => events)).rejects.toThrow();
    expect(await readFile(path, 'utf8')).toBe('preserve');
});
it('rejects oversized release histories before parsing', async () =>
{
    await writeFile(join(root, 'releases/sample.json'), 'x'.repeat(1_048_577));
    await expect(readLedger(root, 'sample')).rejects.toThrow(/size/);
});
it.each([
    { schemaVersion: 2, extension: 'sample', events: [] },
    { schemaVersion: 1, extension: 'other', events: [] },
    { schemaVersion: 1, extension: 'sample', events: [], secret: 'not allowed' },
])('rejects unsupported or unexpected history %j', async value =>
{
    await writeFile(join(root, 'releases/sample.json'), JSON.stringify(value));
    await expect(readLedger(root, 'sample')).rejects.toThrow();
});
it('rejects a symlinked record without reading its target', async () =>
{
    await writeFile(join(root, 'private-data'), 'private');
    await symlink(join(root, 'private-data'), join(root, 'releases/sample.json'));
    await expect(readLedger(root, 'sample')).rejects.toThrow(/symlink/);
});
