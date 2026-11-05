// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 7841acec-3d0e-477d-9e87-8947d029cb7f
// Created: 2026
// COMPONENT: Local product adapter
// PURPOSE: Compile separate host and browser bundles with public callback wrappers.
// RELATES: specs/product-adapter.md
// FLOW: Validate configured source -> perform local work -> report verified output.

import { build } from 'esbuild';
import { mkdir, mkdtemp, writeFile, realpath } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
import ts from 'typescript';
import { claimOutput } from './files.ts';
import { productFile } from './product-config.ts';
import type { ProductInputs } from './product-inputs.ts';
import type { BuildInfo } from './version.ts';

/** Bundle actual product source without changing document behavior or contacting Google. */
export async function buildProduct(root: string, product: ProductInputs, info: BuildInfo): Promise<string>
{
    await requireCallbacks(product);
    const server = await bundleProduct(product, 'server', info);
    const html = product.browser ? await browserHtml(product, info) : undefined;
    const manifest = await productFile(product.directory, 'docs/appsscript.json');
    const output = await mkdtemp(join(await claimOutput(root, 'build'), `${product.name}-`));
    const runtime = join(output, 'apps-script');
    await mkdir(runtime);
    const callbacks = product.callbacks.map(name =>
        `function ${name}() { return OutcropProduct.${name}.apply(null, arguments); }`).join('\n');
    await writeFile(join(runtime, 'Code.gs'), `${server}\n${callbacks}\n`);
    if (html !== undefined)
    {
        await writeFile(join(runtime, 'Index.html'), html);
    }
    await writeFile(join(runtime, 'appsscript.json'), manifest);
    await writeFile(join(output, 'build-info.json'), JSON.stringify(info, null, 4) + '\n');
    return output;
}

/** Global wrappers require actual named exports, not default exports or ambient declarations. */
async function requireCallbacks(product: ProductInputs): Promise<void>
{
    const code = await productFile(product.directory, 'docs/server.ts');
    const source = ts.createSourceFile('server.ts', code, ts.ScriptTarget.ES2020, true);
    const names = source.statements.filter(ts.isFunctionDeclaration).filter(node => node.body &&
        node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
        !node.modifiers?.some(modifier => [ts.SyntaxKind.AsyncKeyword, ts.SyntaxKind.DefaultKeyword]
            .includes(modifier.kind)))
        .map(node => node.name?.text);
    if (product.callbacks.some(name => !names.includes(name)))
    {
        throw new Error('PRODUCT_CALLBACK: Each callback must be a named, synchronous exported server function.');
    }
}

/** Keep the dependency closure within this product's authored runtime modules. */
async function bundleProduct(product: ProductInputs, boundary: 'server' | 'client', info: BuildInfo): Promise<string>
{
    const server = boundary === 'server';
    const result = await build({ absWorkingDir: product.directory,
        entryPoints: [`docs/${boundary}.ts`], bundle: true, write: false, format: 'iife',
        globalName: server ? 'OutcropProduct' : 'OutcropClient', platform: server ? 'neutral' : 'browser',
        target: 'es2020', metafile: true, sourcemap: false, legalComments: 'inline',
        define: { __BUILD_INFO__: JSON.stringify(info) },
        banner: { js: `// Build identity: ${JSON.stringify(info)}` },
    });
    for (const input of Object.keys(result.metafile.inputs))
    {
        // esbuild represents the trusted injected identity as a virtual input, not a source file.
        if (input === '<define:__BUILD_INFO__>')
        {
            continue;
        }
        const path = await realpath(resolve(product.directory, input));
        const local = relative(product.directory, path).replaceAll('\\', '/');
        if (isAbsolute(local) || !/^(docs|shared)\/(?!.*(?:^|\/)test\/).*\.ts$/.test(local) ||
            /\.(test|spec|d)\.ts$/.test(local))
        {
            throw new Error('PRODUCT_BOUNDARY: Runtime imports must stay in this extension docs/ or shared/ source.');
        }
    }
    return result.outputFiles[0]!.text;
}

/** Insert trusted build assets without allowing script or style delimiters to escape their elements. */
async function browserHtml(product: ProductInputs, info: BuildInfo): Promise<string>
{
    const html = await productFile(product.directory, 'docs/Index.html');
    if (html.split('<!-- STYLE -->').length !== 2 || html.split('<!-- SCRIPT -->').length !== 2)
    {
        throw new Error('PRODUCT_TEMPLATE: Include exactly one STYLE slot and one SCRIPT slot.');
    }
    const css = await productFile(product.directory, 'docs/style.css');
    if (/<\/style/i.test(css))
    {
        throw new Error('PRODUCT_STYLE: Closing style tags are unsupported in stylesheet source.');
    }
    const client = await bundleProduct(product, 'client', info);
    return html.replace('<!-- STYLE -->', () => `<style>${css}</style>`)
        .replace('<!-- SCRIPT -->', () => `<script>${client.replace(/<\/script/gi, '<\\/script')}</script>`);
}
