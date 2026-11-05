// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: ae35821f-3caa-4740-b250-4cc45c286130
// Created: 2026
// COMPONENT: Local product adapter
// PURPOSE: Check runtime types, source lint, and independent product coverage.
// RELATES: specs/product-adapter.md
// FLOW: Validate configured source -> perform local work -> report verified output.

import { join } from 'node:path';
import { run } from './process.ts';
import type { ProductInputs } from './product-inputs.ts';

/** Enforce a distinct coverage gate so tooling coverage cannot conceal untested product source. */
export async function validateProduct(root: string, product: ProductInputs): Promise<void>
{
    const typescript = join(root, 'node_modules/typescript/bin/tsc');
    const common = ['--strict', '--noEmit', '--target', 'ES2020', '--module', 'ESNext',
        '--moduleResolution', 'Bundler', '--allowImportingTsExtensions'];
    await run(process.execPath, [typescript, '-p', 'docs/tsconfig.server.json', ...common,
        '--types', 'google-apps-script', '--lib', 'ES2020'], product.directory);
    if (product.browser)
    {
        await run(process.execPath, [typescript, '-p', 'docs/tsconfig.client.json', ...common,
            '--lib', 'ES2020,DOM'], product.directory);
    }
    await run(process.execPath, [join(root, 'node_modules/eslint/bin/eslint.js'),
        '--config', join(root, 'eslint.config.mjs'), '.'], product.directory);
    await run(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run',
        '--config', 'vitest.config.ts', '--root', product.directory, '--coverage',
        '--coverage.provider=v8', '--coverage.include=docs/**/*.ts', '--coverage.include=shared/**/*.ts',
        '--coverage.thresholds.lines=90', '--coverage.thresholds.statements=90',
        '--coverage.thresholds.functions=90', '--coverage.thresholds.branches=80',
        '--passWithNoTests=false'], product.directory);
}
