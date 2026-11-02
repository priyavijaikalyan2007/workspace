// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 63eb050e-5d94-496a-9af2-116abc134b55
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Verify actual package bytes before recording a production candidate.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { rejectLink } from './files.ts';
import { canonical, hashes, object } from './release-data.ts';
import type { BuildInfo } from './version.ts';

const expectedFiles = [
    'apps-script/Code.gs', 'apps-script/Index.html', 'apps-script/appsscript.json', 'build-info.json',
];

/** Packages are data, not executable instructions. Refuse fixtures, links, extra files, or modified bytes. */
export async function inspectProductionPackage(
    root: string, path: string, extension: string, info: BuildInfo,
): Promise<Record<string, string>>
{
    const base = resolve(root, 'dist');
    const child = relative(base, resolve(path));
    if (!child || child.startsWith('..') || child.includes(sep))
    {
        throw new Error('RELEASE_PACKAGE: Package must be a direct child of owned dist output.');
    }
    await rejectLink(base);
    await rejectLink(path);
    await rejectLink(join(path, 'apps-script'));
    await requireLayout(path);
    const manifest = object(JSON.parse(await readFile(join(path, 'manifest.json'), 'utf8')));
    if (manifest.schemaVersion !== 1 || manifest.extension !== extension || manifest.environment !== 'prod' ||
        'fixture' in manifest)
    {
        throw new Error('RELEASE_PACKAGE: Invalid production manifest. Fixtures cannot become production releases.');
    }
    const files = hashes(manifest.files);
    await requireFiles(path, files);
    if (canonical(JSON.parse(await readFile(join(path, 'build-info.json'), 'utf8'))) !== canonical(info))
    {
        throw new Error('RELEASE_PACKAGE: Embedded identity differs from the candidate. Rebuild the package.');
    }
    return files;
}

async function requireLayout(path: string): Promise<void>
{
    for (const file of ['manifest.json', 'build-info.json'])
    {
        if (!(await lstat(join(path, file))).isFile())
        {
            throw new Error('RELEASE_PACKAGE: Package metadata must be regular files, not links.');
        }
    }
    if (canonical((await readdir(path)).sort()) !== canonical(['apps-script', 'build-info.json', 'manifest.json']) ||
        canonical((await readdir(join(path, 'apps-script'))).sort()) !==
        canonical(['Code.gs', 'Index.html', 'appsscript.json']))
    {
        throw new Error('RELEASE_PACKAGE: Unexpected package files. Inspect the generated output.');
    }
}

async function requireFiles(path: string, files: Record<string, string>): Promise<void>
{
    if (canonical(Object.keys(files).sort()) !== canonical(expectedFiles))
    {
        throw new Error('RELEASE_PACKAGE: Missing or unexpected artifact hashes. Inspect the manifest.');
    }
    for (const file of expectedFiles)
    {
        const location = join(path, file);
        if (!(await lstat(location)).isFile() ||
            createHash('sha256').update(await readFile(location)).digest('hex') !== files[file])
        {
            throw new Error('RELEASE_PACKAGE: Artifact hash mismatch or linked input. Rebuild before recording.');
        }
    }
}
