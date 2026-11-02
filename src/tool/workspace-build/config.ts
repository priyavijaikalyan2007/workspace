// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 8931579f-8347-48ac-aa8c-c161655ae503
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Keep declared extension readiness separate from generated directories.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface ExtensionConfig
{
    name: string;
    path: string;
    state: 'planned' | 'ready';
}

/** Validate registry data before using any configured source path. */
export async function readExtensions(root: string): Promise<ExtensionConfig[]>
{
    const data: unknown = JSON.parse(await readFile(resolve(root, 'workspace.config.json'), 'utf8'));
    if (!data || typeof data !== 'object' || !('schemaVersion' in data) || data.schemaVersion !== 1 ||
        !('extensions' in data) || !Array.isArray(data.extensions))
    {
        throw new Error('CONFIG: Invalid workspace registry. Restore workspace.config.json.');
    }
    const entries = data.extensions.map(readEntry);
    if (new Set(entries.map(entry => entry.name)).size !== entries.length)
    {
        throw new Error('CONFIG: Duplicate extension names. Correct the registry.');
    }
    return entries;
}

function readEntry(data: unknown): ExtensionConfig
{
    if (!data || typeof data !== 'object' || !('name' in data) || typeof data.name !== 'string' ||
        !/^[a-z][a-z0-9-]*$/.test(data.name) || !('path' in data) ||
        data.path !== `src/extensions/googleworkspace/${data.name}` || !('state' in data) ||
        (data.state !== 'planned' && data.state !== 'ready'))
    {
        throw new Error('CONFIG: Invalid extension entry. Use the documented source convention.');
    }
    return { name: data.name, path: data.path, state: data.state };
}

/** Explicit product selection must never succeed on scaffolding alone. */
export async function loadExtension(root: string, name: string): Promise<ExtensionConfig>
{
    const entry = (await readExtensions(root)).find(item => item.name === name);
    if (!entry)
    {
        throw new Error('CONFIG: Unknown extension. Check workspace.config.json.');
    }
    if (entry.state === 'planned')
    {
        throw new Error('NOT_READY: Extension is planned. Define and implement its product scope first.');
    }
    return entry;
}
