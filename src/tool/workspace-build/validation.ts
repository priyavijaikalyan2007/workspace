// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 961ab2c2-b476-4397-a2ca-0ba261479144
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Run the complete shared validation contract before packaging.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { join } from 'node:path';
import { run } from './process.ts';
import { validateDependencies } from './policy.ts';

/** Every prerequisite is required. Stop immediately after the first failed check. */
export async function validate(root: string): Promise<void>
{
    await validateDependencies(root);
    await run('/bin/bash', ['./configure.sh', '--check'], root);
    for (const script of ['typecheck', 'lint', 'test', 'test:shell', 'test:instructions'])
    {
        await run('npm', ['run', script], root);
    }
    await run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'),
        '-p', 'test/fixtures/googleworkspace/tsconfig.server.json'], root);
    await run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'),
        '-p', 'test/fixtures/googleworkspace/tsconfig.client.json'], root);
}
