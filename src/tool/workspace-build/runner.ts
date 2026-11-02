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
import { commandHelp, parseArguments, remoteOperations } from './args.ts';
import { buildFixture, buildTool } from './build.ts';
import { loadExtension, readExtensions } from './config.ts';
import { cleanOutput } from './files.ts';
import { packageArtifact } from './package.ts';
import { readSourceState } from './source.ts';
import { readBuildProperties } from './properties.ts';
import { validate } from './validation.ts';
import { createBuildInfo } from './version.ts';
import type { CliOptions } from './args.ts';
import { readLedger } from './release-store.ts';
import { currentProduction } from './release-state.ts';
import { loadGoogleTarget } from './google-target.ts';
import { checkBilling } from './billing.ts';

/** Dispatch only validated commands. No local operation requests Google authorization. */
export async function execute(root: string, args: string[]): Promise<void>
{
    const options = parseArguments(args);
    if (await readOnlyOperation(root, options))
    {
        return;
    }
    if (options.operation === 'preflight')
    {
        await billingPreflight(root, options);
        return;
    }
    if (remoteOperations.includes(options.operation))
    {
        throw new Error('REMOTE_UNCONFIGURED: Configure Apps Script IDs, product adapters, and a release client.');
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

async function billingPreflight(root: string, options: CliOptions): Promise<void>
{
    const target = await loadGoogleTarget(root, options.extension!, options.environment);
    const billing = await checkBilling(target, process.env.GOOGLE_ACCOUNT ?? '');
    console.log(JSON.stringify({ extension: target.extension, environment: target.environment,
        billing, scriptConfigured: target.scriptId !== null }, null, 4));
}

async function readOnlyOperation(root: string, options: CliOptions): Promise<boolean>
{
    if (options.help)
    {
        console.log(commandHelp(options.operation));
        return true;
    }
    if (options.operation !== 'release')
    {
        return false;
    }
    if (!(await readExtensions(root)).some(entry => entry.name === options.extension))
    {
        throw new Error('RELEASE_CONFIG: Unknown extension. Check workspace.config.json.');
    }
    const events = await readLedger(root, options.extension!);
    console.log(JSON.stringify({ extension: options.extension, currentProduction: currentProduction(events) ?? null,
        events }, null, 4));
    return true;
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
        throw new Error('RELEASE_NOT_READY: Configure a product adapter first. Fixtures are local validation only.');
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
