// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 5a73fb71-40e0-426b-91cb-8ae7aa94e146
// Created: 2026
// COMPONENT: Product adapter tests
// PURPOSE: Verify local extension contracts without claiming a Markdown implementation.
// RELATES: specs/product-adapter.md
// FLOW: Create synthetic source -> execute local adapter -> verify artifact or safe failure.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile, readdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { loadProduct, productFile } from '../product-config.ts';
import { buildProduct } from '../product-build.ts';
import { packageArtifact } from '../package.ts';
import { createBuildInfo } from '../version.ts';
import { productFixture } from './product-fixture.ts';

let root: string;
let directory: string;
const info = createBuildInfo({ version: '0.7.2', commit: 'c'.repeat(40), dirty: true,
    clock: new Date('2026-11-05T08:00:00Z'), environment: 'dev' });
beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop product '));
    directory = await productFixture(root);
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});

/** Replace only the contract under test. */
async function contract(value: unknown): Promise<void>
{
    await writeFile(join(directory, 'package.json'), JSON.stringify(value));
}

describe('product source contract', () =>
{
    it('reads the extension package version rather than the root version', async () =>
    {
        expect(await loadProduct(root, 'sample')).toMatchObject({ version: '0.7.2', browser: false,
            callbacks: ['onOpen', 'getInfo'] });
    });
    it('keeps planned Markdown protected by the registry', async () =>
    {
        await expect(loadProduct(process.cwd(), 'markdown')).rejects.toThrow(/NOT_READY/);
    });
    it.each([null, {}, { version: 'latest' }, { private: true, version: '0.1.0',
        workspaceExtension: { schemaVersion: 1, callbacks: [], browser: false } },
    ...['class', 'x);bad(', 'OutcropProduct', 'onOpen_', 'await'].map(name => ({
        private: true, version: '0.1.0', workspaceExtension: { schemaVersion: 1, callbacks: [name], browser: false },
    }))])('rejects malformed package or callback contract %j', async value =>
    {
        await contract(value);
        await expect(loadProduct(root, 'sample')).rejects.toThrow(/PRODUCT/);
    });
    it('rejects duplicate callback names', async () =>
    {
        await contract({ private: true, version: '0.1.0', workspaceExtension: {
            schemaVersion: 1, callbacks: ['onOpen', 'onOpen'], browser: false } });
        await expect(loadProduct(root, 'sample')).rejects.toThrow(/PRODUCT/);
    });
    it('rejects traversal through the product file reader', async () =>
    {
        await writeFile(join(root, 'outside.ts'), 'private to another component');
        const product = await loadProduct(root, 'sample');
        await expect(productFile(product.directory, '../../../../outside.ts')).rejects.toThrow(/PRODUCT/);
    });
    it('rejects a missing required input', async () =>
    {
        await rm(join(directory, 'docs/server.ts'));
        await expect(loadProduct(root, 'sample')).rejects.toThrow(/PRODUCT/);
    });
    it('rejects a linked source input', async () =>
    {
        await rm(join(directory, 'docs/server.ts'));
        await symlink(join(directory, 'docs/tsconfig.server.json'), join(directory, 'docs/server.ts'));
        await expect(loadProduct(root, 'sample')).rejects.toThrow(/PRODUCT/);
    });
});

describe('product runtime artifacts', () =>
{
    it('keeps callable global functions and forwards their event arguments', async () =>
    {
        const output = await buildProduct(root, await loadProduct(root, 'sample'), info);
        const context: { onOpen?: (event: unknown) => unknown; getInfo?: () => unknown } = {};
        runInNewContext(await readFile(join(output, 'apps-script/Code.gs'), 'utf8'), context);
        expect([context.onOpen?.({ value: 3 }), context.getInfo?.()]).toEqual([{ value: 3 }, info]);
    });
    it('builds server-only extensions without adding a browser interface', async () =>
    {
        const output = await buildProduct(root, await loadProduct(root, 'sample'), info);
        expect((await readdir(join(output, 'apps-script'))).sort()).toEqual(['Code.gs', 'appsscript.json']);
    });
    it('keeps browser code separate and escapes closing script tags', async () =>
    {
        await productFixture(root, true);
        const output = await buildProduct(root, await loadProduct(root, 'sample'), info);
        const html = await readFile(join(output, 'apps-script/Index.html'), 'utf8');
        expect([html.includes(info.version), (html.match(/<\/script>/gi) ?? []).length]).toEqual([true, 1]);
    });
    it('avoids stale browser output when a later build is server-only', async () =>
    {
        await productFixture(root, true);
        await buildProduct(root, await loadProduct(root, 'sample'), info);
        await productFixture(root, false);
        const output = await buildProduct(root, await loadProduct(root, 'sample'), info);
        expect(await readdir(join(output, 'apps-script'))).not.toContain('Index.html');
    });
    it('rejects missing callback implementations before output exists', async () =>
    {
        await writeFile(join(directory, 'docs/server.ts'), 'export const onOpen = 1;');
        await expect(buildProduct(root, await loadProduct(root, 'sample'), info)).rejects.toThrow(/callback/i);
        expect(await readdir(root)).not.toContain('build');
    });
    it('rejects a default export masquerading as a named callback', async () =>
    {
        await writeFile(join(directory, 'docs/server.ts'),
            'export default function onOpen() {} export function getInfo() {}');
        await expect(buildProduct(root, await loadProduct(root, 'sample'), info)).rejects.toThrow(/callback/i);
    });
    it('rejects stylesheet text that closes the generated style element', async () =>
    {
        await productFixture(root, true);
        await writeFile(join(directory, 'docs/style.css'), '</style><script>bad</script>');
        await expect(buildProduct(root, await loadProduct(root, 'sample'), info)).rejects.toThrow(/PRODUCT_STYLE/);
    });
    it('rejects source imported from outside the extension', async () =>
    {
        await writeFile(join(root, 'outside.ts'), 'export const outside = 3;');
        await writeFile(join(directory, 'docs/server.ts'),
            'import { outside } from "../../../../../outside.ts";\n' +
            'export function onOpen() { return outside; } export function getInfo() { return outside; }');
        await expect(buildProduct(root, await loadProduct(root, 'sample'), info)).rejects.toThrow(/PRODUCT/);
    });
    it.each(['{broken', '{"runtimeVersion":"DEPRECATED_ES5"}'])('rejects invalid manifest %s', async value =>
    {
        await writeFile(join(directory, 'docs/appsscript.json'), value);
        await expect(loadProduct(root, 'sample')).rejects.toThrow(/manifest/i);
    });
    it('requires an empty automatic type list for browser compilation', async () =>
    {
        await productFixture(root, true);
        await writeFile(join(directory, 'docs/tsconfig.client.json'), '{"compilerOptions":{"types":["node"]}}');
        await expect(loadProduct(root, 'sample')).rejects.toThrow(/PRODUCT_TYPES/);
    });
    it('rejects a browser template without exactly one slot for each generated asset', async () =>
    {
        await productFixture(root, true);
        await writeFile(join(directory, 'docs/Index.html'), '<html><!-- SCRIPT --></html>');
        await expect(buildProduct(root, await loadProduct(root, 'sample'), info)).rejects.toThrow(/template/i);
    });
    it('creates hashed local development packages marked with their extension', async () =>
    {
        const output = await buildProduct(root, await loadProduct(root, 'sample'), info);
        const packaged = await packageArtifact(root, output, 'sample-dev', async () =>
        {}, 'sample');
        const manifest = JSON.parse(await readFile(join(packaged, 'manifest.json'), 'utf8'));
        expect(manifest).toMatchObject({ schemaVersion: 1, extension: 'sample', environment: 'dev',
            files: { 'apps-script/Code.gs': expect.stringMatching(/^[a-f0-9]{64}$/) } });
        expect(manifest).not.toHaveProperty('fixture');
    });
});
