// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 00f2b928-f6e7-4bdf-b889-1bd7d8c93943
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Validate and hash an immutable local fixture package without implying release readiness.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { claimOutput, rejectLink } from './files.ts';

const runtimeFiles = ['Code.gs', 'Index.html', 'appsscript.json'];

/** Validation must complete before package directories are created or artifacts copied. */
export async function packageArtifact(
    root: string, source: string, name: string, validate: () => Promise<void>,
): Promise<string>
{
    await validate();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9.+-]*$/.test(name))
    {
        throw new Error('PACKAGE: Invalid package name. Use a safe artifact identifier.');
    }
    const files = await inspectArtifact(source);
    const target = join(await claimOutput(root, 'dist'), name);
    await mkdir(target); // Exclusive creation makes accidental replacement fail.
    try
    {
        for (const file of await readdir(source))
        {
            await cp(join(source, file), join(target, file),
                { recursive: true, errorOnExist: true, force: false });
        }
        await writeFile(join(target, 'manifest.json'), JSON.stringify({ fixture: true, files }, null, 4) + '\n');
        return target;
    }
    catch (error)
    {
        await rm(target, { recursive: true, force: true });
        throw error;
    }
}

async function inspectArtifact(source: string): Promise<Record<string, string>>
{
    await rejectLink(source);
    await rejectLink(join(source, 'apps-script'));
    const actual = (await readdir(join(source, 'apps-script'))).sort();
    if (JSON.stringify(actual) !== JSON.stringify(runtimeFiles) ||
        JSON.stringify((await readdir(source)).sort()) !== JSON.stringify(['apps-script', 'build-info.json']))
    {
        throw new Error('PACKAGE: Unexpected runtime files. Rebuild the controlled fixture.');
    }
    const files: Record<string, string> = {};
    for (const name of ['build-info.json', ...runtimeFiles.map(file => `apps-script/${file}`)])
    {
        const path = join(source, name);
        if (!(await lstat(path)).isFile())
        {
            throw new Error('PACKAGE: Runtime input must be a regular file. Remove links and rebuild.');
        }
        files[name] = createHash('sha256').update(await readFile(path)).digest('hex');
    }
    await verifyManifest(source);
    return files;
}

async function verifyManifest(source: string): Promise<void>
{
    try
    {
        const manifest: unknown = JSON.parse(await readFile(join(source, 'apps-script/appsscript.json'), 'utf8'));
        if (!manifest || typeof manifest !== 'object' || !('runtimeVersion' in manifest) ||
            manifest.runtimeVersion !== 'V8')
        {
            throw new Error('Expected V8 manifest.');
        }
    }
    catch
    {
        throw new Error('PACKAGE: Invalid Apps Script manifest. Rebuild the fixture before packaging.');
    }
}
