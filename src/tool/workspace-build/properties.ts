// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: f514d556-70f9-4f82-b468-51fe13187386
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Read the package-owned base version and optional checked-in build number.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface BuildProperties
{
    version: string;
    buildProperty?: string;
}

/** Environment overrides are applied later so repository defaults remain independently inspectable. */
export async function readBuildProperties(root: string): Promise<BuildProperties>
{
    const packageData: unknown = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    const config: unknown = JSON.parse(await readFile(join(root, 'workspace.config.json'), 'utf8'));
    if (!packageData || typeof packageData !== 'object' || !('version' in packageData) ||
        typeof packageData.version !== 'string' || !config || typeof config !== 'object')
    {
        throw new Error('PROPERTIES: Package version and build properties must have the documented types.');
    }
    const properties = 'buildProperties' in config ? config.buildProperties : {};
    if (!properties || typeof properties !== 'object')
    {
        throw new Error('PROPERTIES: buildProperties must be an object.');
    }
    const result: BuildProperties = { version: packageData.version };
    if ('buildNumber' in properties)
    {
        if (typeof properties.buildNumber !== 'string')
        {
            throw new Error('PROPERTIES: buildNumber must be a string when supplied.');
        }
        result.buildProperty = properties.buildNumber;
    }
    return result;
}
