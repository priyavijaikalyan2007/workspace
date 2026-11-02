// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: a4c4fc65-aa8f-47ce-ba7f-c5cac62a542d
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Validate bounded release data without trusting serialized TypeScript types.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { createHash } from 'node:crypto';

export function object(value: unknown): Record<string, unknown>
{
    if (!isObject(value))
    {
        throw new Error('RELEASE_DATA: Expected a release object. Inspect the saved record.');
    }
    return value;
}

function isObject(value: unknown): value is Record<string, unknown>
{
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function text(value: unknown): string
{
    if (typeof value !== 'string' || value.length === 0 || value.length > 512)
    {
        throw new Error('RELEASE_DATA: Expected bounded release text. Inspect the saved record.');
    }
    return value;
}

export function positive(value: unknown): number
{
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1)
    {
        throw new Error('RELEASE_DATA: Expected a positive release number. Inspect the saved record.');
    }
    return value;
}

/** Sort object keys so hashes and comparisons do not depend on JSON property order. */
export function canonical(value: unknown): string
{
    return JSON.stringify(value, (_key, item: unknown) =>
    {
        if (isObject(item))
        {
            return Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]));
        }
        return item;
    });
}

export function digest(value: unknown): string
{
    return createHash('sha256').update(canonical(value)).digest('hex');
}

export function hashes(value: unknown): Record<string, string>
{
    const result: Record<string, string> = {};
    for (const [key, item] of Object.entries(object(value)))
    {
        if (!/^(?:apps-script\/)?[A-Za-z0-9][A-Za-z0-9.-]*$/.test(key) || key.includes('..') ||
            typeof item !== 'string' || !/^[a-f0-9]{64}$/.test(item))
        {
            throw new Error('RELEASE_DATA: Invalid artifact hash. Rebuild and inspect the package.');
        }
        result[key] = item;
    }
    if (Object.keys(result).length === 0)
    {
        throw new Error('RELEASE_DATA: Artifact hashes are missing. Rebuild the package.');
    }
    return result;
}
