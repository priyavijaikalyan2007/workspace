// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 654a2aee-c0f5-4934-9d4b-219daef87c8d
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Reject prohibited React dependencies before validating or packaging an artifact.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Inspect the resolved graph so transitive packages cannot bypass the UI architecture rule. */
export async function validateDependencies(root: string): Promise<void>
{
    const lock: unknown = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
    if (!lock || typeof lock !== 'object' || !('packages' in lock) ||
        !lock.packages || typeof lock.packages !== 'object')
    {
        throw new Error('DEPENDENCY: Missing lockfile package graph. Run npm ci from a valid checkout.');
    }
    if (Object.keys(lock.packages).some(name => /(^|[/@-])react($|[/@-])/.test(name)))
    {
        throw new Error('DEPENDENCY: React is prohibited, including transitive adapters and tooling.');
    }
}
