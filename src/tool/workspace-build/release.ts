// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 37108061-5510-4e9a-b5f8-c0afc20458b7
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Apply candidate, failure, production, and rollback transitions through verified local history.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadExtension } from './config.ts';
import { withLedger } from './release-store.ts';
import { findCandidate, nextSequence, requireCandidateSlot } from './release-state.ts';
import { readSourceState } from './source.ts';
import { createBuildInfo } from './version.ts';
import { inspectProductionPackage } from './release-artifact.ts';
import { digest, object } from './release-data.ts';
import { readObservation, requireObservation } from './observation.ts';
import type { BuildInfo } from './version.ts';
import type { ReleaseEvent } from './release-event.ts';
import type { ProductionObservation } from './observation.ts';

/** Allocate metadata under the extension lock, then record only verified package bytes. */
export async function createCandidate(
    root: string, extension: string, version: string, build: (info: BuildInfo) => Promise<string>,
    properties: { buildNumber?: string; buildProperty?: string } = {},
): Promise<ReleaseEvent>
{
    const config = await loadExtension(root, extension);
    const packageData = object(JSON.parse(await readFile(join(root, config.path, 'package.json'), 'utf8')));
    if (packageData.version !== version)
    {
        throw new Error('RELEASE_VERSION: Explicit version must match the checked-in package version.');
    }
    const result = await withLedger(root, extension, async events =>
    {
        const source = await readSourceState(root);
        if (source.dirty)
        {
            throw new Error('RELEASE_SOURCE: Production requires clean committed source before the build.');
        }
        const info = createBuildInfo({ version, ...source, ...properties,
            environment: 'prod', sequence: nextSequence(events), clock: new Date() });
        requireCandidateSlot(events, info.version);
        const files = await inspectProductionPackage(root, await build(info), extension, info);
        await requireUnchangedSource(root, source.commit);
        return [...events, { ...identity(), kind: 'candidate', info, files, digest: digest(files) }];
    });
    return result.at(-1)!;
}

async function requireUnchangedSource(root: string, commit: string): Promise<void>
{
    const current = await readSourceState(root);
    if (current.dirty || current.commit !== commit)
    {
        throw new Error('RELEASE_SOURCE: Source changed during packaging. Preserve the package and inspect changes.');
    }
}

function identity(): { id: string; at: string }
{
    return { id: randomUUID(), at: new Date().toISOString() };
}

/** Public stable reason codes preserve privacy and never erase earlier production state. */
export async function failCandidate(
    root: string, extension: string, candidateId: string, reasonCode: string,
): Promise<ReleaseEvent>
{
    const result = await withLedger(root, extension, async events =>
        [...events, { ...identity(), kind: 'failed', candidateId, reasonCode }]);
    return result.at(-1)!;
}

/** A trusted host adapter must observe real publication. Upload success is insufficient. */
export async function confirmProduction(
    root: string, extension: string, candidateId: string,
    verify: (event: ReleaseEvent) => Promise<ProductionObservation>,
    options: { target: { projectId: string; scriptId: string }; rollback?: boolean },
): Promise<ReleaseEvent>
{
    const result = await withLedger(root, extension, async events =>
    {
        const candidate = findCandidate(events, candidateId);
        const observation = readObservation(await verify(candidate));
        requireObservation(candidate, observation, options.target, true);
        return [...events, { ...identity(), kind: options.rollback ? 'rollback' : 'production',
            candidateId, observation }];
    });
    return result.at(-1)!;
}
