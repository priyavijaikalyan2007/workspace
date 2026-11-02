// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 328f4fad-0951-4751-b051-eaa30dac89a7
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Run fixed subprocesses without shell interpolation and propagate failure.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { spawn } from 'node:child_process';

/** Arguments remain separate from executable text. Never pass secrets through arguments. */
export async function run(command: string, args: string[], cwd: string): Promise<void>
{
    await new Promise<void>((resolve, reject) =>
    {
        const child = spawn(command, args, { cwd, stdio: 'inherit', shell: false });
        child.on('error', reject);
        child.on('exit', (code, signal) =>
        {
            if (code === 0)
            {
                resolve();
                return;
            }
            reject(new Error(`CHECK: ${command} failed (${signal ?? code}). Correct the reported failure.`));
        });
    });
}
