// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 5e97115e-2d58-48ff-9503-55a7514e7b50
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Create immutable embedded identity from verified source and UTC build inputs.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { valid } from 'semver';

export interface BuildInfo
{
    version: string;
    commit: string;
    dirty: boolean;
    builtAt: string;
    environment: 'dev' | 'prod';
    buildNumber: string;
    releaseSequence: number | null;
}

/** Build metadata never changes SemVer precedence or replaces the actual Git commit. */
export function createBuildInfo(input: {
    version: string; commit: string; dirty: boolean; clock: Date;
    environment: 'dev' | 'prod'; buildNumber?: string; buildProperty?: string; sequence?: number;
}): BuildInfo
{
    if (valid(input.version) !== input.version || /[-+]/.test(input.version))
    {
        throw new Error('VERSION: Supply an exact stable major.minor.patch version.');
    }
    if (!/^[a-f0-9]{40}$/.test(input.commit))
    {
        throw new Error('VERSION: Source must have a verified full Git commit.');
    }
    const timestamp = input.clock.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const buildNumber = input.buildNumber ?? input.buildProperty ?? timestamp;
    validateBuildNumber(buildNumber);
    validateProduction(input);
    const prerelease = input.environment === 'prod' ? '' : '-dev';
    const dirtySuffix = input.dirty ? '.dirty' : '';
    return {
        version: `${input.version}${prerelease}+${buildNumber}.g${input.commit.slice(0, 7)}${dirtySuffix}`,
        commit: input.commit, dirty: input.dirty, builtAt: input.clock.toISOString(),
        environment: input.environment, buildNumber, releaseSequence: input.sequence ?? null,
    };
}

function validateBuildNumber(value: string): void
{
    if (!/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/.test(value))
    {
        throw new Error('VERSION: BUILD_NUMBER must contain dot-separated letters, digits, or hyphens.');
    }
}

function validateProduction(input: { environment: string; dirty: boolean; sequence?: number }): void
{
    if (input.environment === 'prod' &&
        (input.dirty || !Number.isSafeInteger(input.sequence) || (input.sequence ?? 0) < 1))
    {
        throw new Error('VERSION: Production requires clean source and a positive release sequence.');
    }
}
