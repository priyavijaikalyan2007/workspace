// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 35fab05f-eb39-4716-b033-b48a0e883d64
// Created: 2026
// COMPONENT: Local product adapter
// PURPOSE: Connect selected local products to validation, identity, builds, and development packages.
// RELATES: specs/product-adapter.md
// FLOW: Validate configured source -> perform local work -> report verified output.

import { loadProduct } from './product-config.ts';
import { buildProduct } from './product-build.ts';
import { validateProduct } from './product-validation.ts';
import { validate } from './validation.ts';
import { validateDependencies } from './policy.ts';
import { readBuildProperties } from './properties.ts';
import { readSourceState } from './source.ts';
import { createBuildInfo } from './version.ts';
import { packageArtifact } from './package.ts';
import type { CliOptions } from './args.ts';
import type { ProductInputs } from './product-inputs.ts';

/** Run a selected local product operation. Local readiness grants no production or remote permissions. */
export async function productOperation(root: string, options: CliOptions, sharedValidated = false): Promise<void>
{
    const product = await loadProduct(root, options.extension!);
    if (options.environment === 'prod')
    {
        throw new Error('RELEASE_NOT_READY: Production adapter and publication verification remain unconfigured.');
    }
    if (options.operation !== 'build')
    {
        if (!sharedValidated)
        {
            await validate(root);
        }
        await validateProduct(root, product);
    }
    if (options.operation === 'test')
    {
        return;
    }
    await buildSelection(root, product, options);
}

/** Build identity follows the product package, while source identity always comes from Git. */
async function buildSelection(root: string, product: ProductInputs, options: CliOptions): Promise<void>
{
    await validateDependencies(root);
    const properties = await readBuildProperties(root);
    const source = await readSourceState(root);
    const info = createBuildInfo({ ...properties, version: options.version ?? product.version, ...source,
        clock: new Date(), environment: 'dev',
        ...(process.env.BUILD_NUMBER === undefined ? {} : { buildNumber: process.env.BUILD_NUMBER }) });
    const output = await buildProduct(root, product, info);
    const result = options.operation === 'package'
        ? await packageArtifact(root, output, `${product.name}-${info.version}`, async () =>
        {}, product.name)
        : output;
    console.log(`${product.name}: local ${options.operation} output: ${result}`);
}
