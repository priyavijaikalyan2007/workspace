// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: c9717fc4-a40c-4998-8710-2d9e38961fa3
// Created: 2026
// COMPONENT: Product adapter tests
// PURPOSE: Verify local extension contracts without claiming a Markdown implementation.
// RELATES: specs/product-adapter.md
// FLOW: Create synthetic source -> execute local adapter -> verify artifact or safe failure.

import { afterEach, beforeEach, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadProduct } from '../product-config.ts';
import { validateProduct } from '../product-validation.ts';
import { productFixture } from './product-fixture.ts';

let root: string;
let directory: string;
beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop native product '));
    await symlink(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
    directory = await productFixture(root);
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});
it('passes real server checks from a path containing spaces', async () =>
{
    await expect(validateProduct(process.cwd(), await loadProduct(root, 'sample'))).resolves.toBeUndefined();
}, 20000);
it('rejects DOM use in the real server type check', async () =>
{
    await writeFile(join(directory, 'docs/server.ts'), 'export function invalid() { return document.body; }');
    await expect(validateProduct(process.cwd(), await loadProduct(root, 'sample'))).rejects.toThrow(/CHECK/);
}, 20000);
it('counts untested product source in its own coverage gate', async () =>
{
    await mkdir(join(directory, 'shared'));
    await writeFile(join(directory, 'shared/untested.ts'),
        'export function unused()\n{\n    return 3;\n}\n');
    await expect(validateProduct(process.cwd(), await loadProduct(root, 'sample'))).rejects.toThrow(/CHECK/);
}, 20000);

it('passes real browser and server checks in separate type environments', async () =>
{
    await productFixture(root, true);
    await writeFile(join(directory, 'test/client.test.ts'),
        'import { expect, it, vi } from "vitest";\n' +
        'vi.stubGlobal("document", { body: { textContent: "" } });\n' +
        'await import("../docs/client.ts");\n' +
        'it("runs browser code", () => expect(document.body.textContent).toContain("bad"));');
    await expect(validateProduct(process.cwd(), await loadProduct(root, 'sample'))).resolves.toBeUndefined();
}, 20000);
