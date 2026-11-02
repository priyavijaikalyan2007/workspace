// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: f0469ccd-c3ff-4c30-b0dc-df7c7bce7ee8
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Check live billing state and reject linked, enabled, missing, or mismatched information.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GoogleTarget } from './google-target.ts';

export interface BillingState
{
    projectId: string;
    billingEnabled: false;
    billingAccountName: '';
    verifiedAt: string;
}

const executeFile = promisify(execFile);

/** An authoritative explicit false and empty account are both required. Closed linked accounts also fail. */
export function requireUnbilled(value: unknown, projectId: string): BillingState
{
    if (!value || typeof value !== 'object' || !('projectId' in value) || value.projectId !== projectId ||
        !('name' in value) || value.name !== `projects/${projectId}/billingInfo` ||
        !('billingEnabled' in value) || value.billingEnabled !== false ||
        !('billingAccountName' in value) || value.billingAccountName !== '')
    {
        throw new Error('BILLING_BLOCKED: Verify disabled billing and no linked billing account before remote work.');
    }
    return { projectId, billingEnabled: false, billingAccountName: '', verifiedAt: new Date().toISOString() };
}

/** Always fetch fresh state. Do not expose raw CLI output or change the active account/default project. */
export async function checkBilling(
    target: GoogleTarget, account: string,
    execute: (command: string, args: string[]) => Promise<string> = executeCommand,
): Promise<BillingState>
{
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account))
    {
        throw new Error('BILLING_ACCOUNT: Select the saved publisher account through GOOGLE_ACCOUNT.');
    }
    try
    {
        const output = await execute('gcloud', ['billing', 'projects', 'describe', target.projectId,
            `--account=${account}`, '--format=json', '--quiet']);
        return requireUnbilled(JSON.parse(output), target.projectId);
    }
    catch
    {
        throw new Error('BILLING_UNVERIFIED: Billing is linked, enabled, or unknown. Inspect project access.');
    }
}

async function executeCommand(command: string, args: string[]): Promise<string>
{
    return (await executeFile(command, args, { encoding: 'utf8', timeout: 20_000, maxBuffer: 65_536 })).stdout;
}
