// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: f3a361ed-3090-418d-9145-485410f2e047
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Protect user data by accepting only explicitly owned generated output roots.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const marker = '.outcrop-output.json';
const signature = 'outcrop-workspace-output-v1';

async function exists(path: string): Promise<boolean>
{
    try
    {
        await lstat(path);
        return true;
    }
    catch (error)
    {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        {
            return false;
        }
        throw error;
    }
}

async function outputPath(root: string, name: string): Promise<string>
{
    if (!['build', 'dist'].includes(name))
    {
        throw new Error('OUTPUT: Only build and dist are generated output roots.');
    }
    const path = join(root, name);
    if (await exists(path) && (await lstat(path)).isSymbolicLink())
    {
        throw new Error('OUTPUT: Refusing a symlink output root. Remove the link manually.');
    }
    return path;
}

async function verifyOwnership(path: string): Promise<void>
{
    const file = join(path, marker);
    if (!(await exists(file)) || (await lstat(file)).isSymbolicLink() ||
        await readFile(file, 'utf8') !== signature)
    {
        throw new Error('OUTPUT: Refusing unowned output. Move existing files before retrying.');
    }
}

/** Claim only a missing or empty directory. Never mark existing user data as disposable. */
export async function claimOutput(root: string, name: string): Promise<string>
{
    const path = await outputPath(root, name);
    await mkdir(path, { recursive: true });
    if ((await readdir(path)).length > 0)
    {
        await verifyOwnership(path);
        return path;
    }
    await writeFile(join(path, marker), signature, { flag: 'wx' });
    return path;
}

/** Remove only output with a verified ownership marker. Recursive removal does not follow symlinks. */
export async function cleanOutput(root: string, name: string): Promise<void>
{
    const path = await outputPath(root, name);
    if (!(await exists(path)))
    {
        return;
    }
    await verifyOwnership(path);
    await rm(path, { recursive: true });
}

/** Reject links before using generated child directories or files. */
export async function rejectLink(path: string): Promise<void>
{
    if (await exists(path) && (await lstat(path)).isSymbolicLink())
    {
        throw new Error('OUTPUT: Refusing a symlink inside generated output. Remove the link manually.');
    }
}
