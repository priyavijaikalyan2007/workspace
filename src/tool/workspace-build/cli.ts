// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 6c8d3383-dd59-4d4a-9206-828f86cd3196
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Provide a thin process boundary with timestamped, actionable failure output.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { execute } from './runner.ts';

try
{
    await execute(process.cwd(), process.argv.slice(2));
}
catch (error)
{
    const message = error instanceof Error ? error.message : 'Unknown failure. Inspect local setup.';
    console.error(`${new Date().toISOString()} [ERROR] ${message}`);
    process.exitCode = 1;
}
