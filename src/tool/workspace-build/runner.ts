// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 891e0394-b665-4301-925a-ac59707b0947
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Dispatch local operations and block remote work until project safeguards exist.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { join } from 'node:path';
import { parseArguments, remoteOperations } from './args.ts';
import { buildFixture, buildTool } from './build.ts';
import { loadExtension, readExtensions } from './config.ts';
import { cleanOutput } from './files.ts';
import { packageArtifact } from './package.ts';
import { readSourceState } from './source.ts';
import { readBuildProperties } from './properties.ts';
import { validate } from './validation.ts';
import { createBuildInfo } from './version.ts';
import type { CliOptions } from './args.ts';

/** Dispatch only validated commands. No local operation requests Google authorization. */
export async function execute(root: string, args: string[]): Promise<void>
{
    const options = parseArguments(args);
    if (options.help)
    {
        console.log(`Usage: ./${options.operation}.sh [--extension NAME | --fixture] [--environment dev|prod]`);
        console.log('Build/package: --version X.Y.Z. Fixture output is local and cannot be deployed.');
        return;
    }
    if (remoteOperations.includes(options.operation))
    {
        throw new Error('REMOTE_UNCONFIGURED: Configure Google projects, credentials, and billing preflight first.');
    }
    if (options.extension)
    {
        await loadExtension(root, options.extension);
        throw new Error('NOT_READY: Product build adapter is not implemented. Do not mark the extension ready yet.');
    }
    if (!options.fixture && ['build', 'test'].includes(options.operation))
    {
        await requireProductAdapters(root);
    }
    await localOperation(root, options);
}

async function requireProductAdapters(root: string): Promise<void>
{
    if ((await readExtensions(root)).some(entry => entry.state === 'ready'))
    {
        throw new Error('NOT_READY: Implement product build and test adapters before marking extensions ready.');
    }
}

async function localOperation(root: string, options: CliOptions): Promise<void>
{
    if (options.operation === 'clean')
    {
        await cleanOutput(root, 'build');
        await cleanOutput(root, 'dist');
        console.log('Removed verified generated output.');
        return;
    }
    if (options.operation === 'test')
    {
        await validate(root);
        return;
    }
    if (options.operation === 'package' && !options.fixture)
    {
        throw new Error('NOT_READY: No product extension is packageable. Use --fixture for tooling validation.');
    }
    await buildSelection(root, options);
}

async function buildSelection(root: string, options: CliOptions): Promise<void>
{
    if (options.environment === 'prod')
    {
        throw new Error('RELEASE_NOT_READY: Production ledger and promotion gates are not implemented. See issue #9.');
    }
    if (options.operation === 'package')
    {
        await validate(root);
    }
    await buildTool(root);
    if (!options.fixture)
    {
        const entries = await readExtensions(root);
        console.log('Built shared tooling. No product extensions were built.');
        for (const entry of entries)
        {
            console.log(`${entry.name}: ${entry.state}. Product build adapter is pending.`);
        }
        return;
    }
    await fixtureOperation(root, options);
}

async function fixtureOperation(root: string, options: CliOptions): Promise<void>
{
    const source = await readSourceState(root);
    const properties = await readBuildProperties(root);
    const info = createBuildInfo({ ...properties, version: options.version ?? properties.version, ...source,
        clock: new Date(), environment: 'dev',
        ...(process.env.BUILD_NUMBER === undefined ? {} : { buildNumber: process.env.BUILD_NUMBER }) });
    const output = await buildFixture(root, root, info);
    if (options.operation === 'package')
    {
        const result = await packageArtifact(root, output, `fixture-${info.version}`, async () =>
        {});
        console.log(`Packaged local validation fixture: ${result}`);
        return;
    }
    console.log(`Built local validation fixture: ${join(output, 'apps-script')}`);
}
