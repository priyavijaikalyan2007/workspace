// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 39040a34-f93f-4d4e-aa1b-5a9441588541
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Validate separate Google project ownership without requiring product implementation.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readExtensions } from './config.ts';
import { object } from './release-data.ts';

export interface GoogleTarget
{
    extension: string;
    environment: 'dev' | 'prod';
    projectId: string;
    projectNumber: string;
    scriptId: string | null;
}

/** Cloud identities are public configuration. Credentials and billing observations are not cached here. */
export async function loadGoogleTarget(
    root: string, extension: string, environment: 'dev' | 'prod',
): Promise<GoogleTarget>
{
    if (!(await readExtensions(root)).some(entry => entry.name === extension))
    {
        throw new Error('GOOGLE_CONFIG: Unknown extension. Inspect the workspace registry.');
    }
    const config = object(JSON.parse(await readFile(join(root, 'workspace.config.json'), 'utf8')));
    if (!Array.isArray(config.extensions))
    {
        throw new Error('GOOGLE_CONFIG: Extension registry is missing.');
    }
    const data = object(config.extensions.find(item => object(item).name === extension));
    const google = object(data.google);
    const dev = readTarget(google.dev);
    const prod = readTarget(google.prod);
    requireSeparation(dev, prod);
    const target = environment === 'dev' ? dev : prod;
    if (!target.projectId || !target.projectNumber)
    {
        throw new Error('GOOGLE_CONFIG: Cloud project identity is unconfigured. Complete project setup first.');
    }
    return { extension, environment, projectId: target.projectId, projectNumber: target.projectNumber,
        scriptId: target.scriptId };
}

function readTarget(value: unknown): { projectId: string | null; projectNumber: string | null; scriptId: string | null }
{
    const data = object(value);
    return {
        projectId: nullable(data.projectId, /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/),
        projectNumber: nullable(data.projectNumber, /^[1-9][0-9]{5,19}$/),
        scriptId: nullable(data.scriptId, /^[A-Za-z0-9_-]{20,}$/),
    };
}

function nullable(value: unknown, pattern: RegExp): string | null
{
    if (value === null)
    {
        return null;
    }
    if (typeof value !== 'string' || !pattern.test(value))
    {
        throw new Error('GOOGLE_CONFIG: Project or script identity is malformed. Inspect the selected environment.');
    }
    return value;
}

function requireSeparation(
    dev: { projectId: string | null; projectNumber: string | null; scriptId: string | null },
    prod: { projectId: string | null; projectNumber: string | null; scriptId: string | null },
): void
{
    if ((dev.projectId && dev.projectId === prod.projectId) ||
        (dev.projectNumber && dev.projectNumber === prod.projectNumber) ||
        (dev.scriptId && dev.scriptId === prod.scriptId))
    {
        throw new Error('GOOGLE_CONFIG: Development and production must use separate Cloud and Apps Script projects.');
    }
}
