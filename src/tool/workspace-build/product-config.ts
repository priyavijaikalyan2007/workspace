// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 3ce6e7d4-eea2-4664-a688-fb9897aa7eb2
// Created: 2026
// COMPONENT: Local product adapter
// PURPOSE: Require declared product source, safe callbacks, and explicit runtime inputs.
// RELATES: specs/product-adapter.md
// FLOW: Validate configured source -> perform local work -> report verified output.

import { lstat, readFile, realpath } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { valid } from 'semver';
import { loadExtension } from './config.ts';
import type { ProductInputs } from './product-inputs.ts';

const MAX_CALLBACKS = 64;
const RESERVED_NAMES = new Set(('await break case catch class const continue debugger default delete do else enum ' +
    'export extends false finally for function if implements import in instanceof interface let new null package ' +
    'private protected public return static super switch this throw true try typeof var void while with yield')
    .split(' '));

/** Read real product inputs only after the registry permits implementation. Planned source always fails. */
export async function loadProduct(root: string, name: string): Promise<ProductInputs>
{
    const entry = await loadExtension(root, name);
    try
    {
        const directory = await realpath(resolve(root, entry.path));
        if (directory !== join(await realpath(root), entry.path))
        {
            throw new Error('PRODUCT: Linked extension directories are unsupported. Use checked-in source.');
        }
        const data = JSON.parse(await productFile(directory, 'package.json'));
        const product = parseProduct(name, directory, data);
        await requireInputs(product);
        return product;
    }
    catch (error)
    {
        if (error instanceof Error && error.message.startsWith('PRODUCT'))
        {
            throw error;
        }
        throw new Error('PRODUCT_INPUT: Missing or malformed product inputs. Follow specs/product-adapter.md.',
            { cause: error });
    }
}

/** Refuse links in both files and their parent directories before reading build inputs. */
export async function productFile(directory: string, name: string): Promise<string>
{
    const path = resolve(directory, name);
    if (!path.startsWith(directory + sep) || !(await lstat(path)).isFile() || await realpath(path) !== path)
    {
        throw new Error('PRODUCT_INPUT: Product inputs must be regular files inside the extension.');
    }
    return readFile(path, 'utf8');
}

/** Reject incomplete package declarations before deriving paths or generating callback code. */
function parseProduct(name: string, directory: string, data: unknown): ProductInputs
{
    if (!data || typeof data !== 'object' || !('private' in data) || data.private !== true ||
        !('version' in data) || typeof data.version !== 'string' || valid(data.version) !== data.version ||
        /[-+]/.test(data.version) || !('workspaceExtension' in data))
    {
        throw new Error('PRODUCT_CONFIG: Supply a private package and stable major.minor.patch version.');
    }
    const config = data.workspaceExtension;
    if (!config || typeof config !== 'object' || !('schemaVersion' in config) || config.schemaVersion !== 1 ||
        !('browser' in config) || typeof config.browser !== 'boolean' || !('callbacks' in config) ||
        !Array.isArray(config.callbacks) || config.callbacks.length === 0 || config.callbacks.length > MAX_CALLBACKS ||
        config.callbacks.some(name => typeof name !== 'string' || !/^[a-z][a-zA-Z0-9]*$/.test(name) ||
            RESERVED_NAMES.has(name)) || new Set(config.callbacks).size !== config.callbacks.length)
    {
        throw new Error('PRODUCT_CONFIG: Define unique public callback names and an explicit browser selection.');
    }
    return { name, directory, version: data.version, callbacks: config.callbacks, browser: config.browser };
}

/** Confirm the selected runtime files exist and retain the authored V8 manifest. */
async function requireInputs(product: ProductInputs): Promise<void>
{
    const required = ['docs/server.ts', 'docs/tsconfig.server.json', 'vitest.config.ts'];
    if (product.browser)
    {
        required.push('docs/client.ts', 'docs/Index.html', 'docs/style.css', 'docs/tsconfig.client.json');
        const config = JSON.parse(await productFile(product.directory, 'docs/tsconfig.client.json'));
        if (!Array.isArray(config?.compilerOptions?.types) || config.compilerOptions.types.length !== 0)
        {
            throw new Error('PRODUCT_TYPES: Set browser compilerOptions.types to [] to exclude server globals.');
        }
    }
    for (const file of required)
    {
        await productFile(product.directory, file);
    }
    let manifest;
    try
    {
        manifest = JSON.parse(await productFile(product.directory, 'docs/appsscript.json'));
    }
    catch
    {
        throw new Error('PRODUCT_MANIFEST: Supply a valid JSON Apps Script manifest.');
    }
    if (!manifest || manifest.runtimeVersion !== 'V8')
    {
        throw new Error('PRODUCT_MANIFEST: Select the Apps Script V8 runtime.');
    }
}
