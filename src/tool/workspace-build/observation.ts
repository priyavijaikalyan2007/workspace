// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 4cddcf3d-151a-4840-bb68-b9f0c94bf4ba
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Keep Google publication evidence separate from application identity.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { object, positive, text } from './release-data.ts';
import type { ReleaseEvent } from './release-event.ts';

export interface ProductionObservation
{
    projectId: string;
    scriptId: string;
    scriptVersion: number;
    version: string;
    commit: string;
    digest: string;
    publicationVerified: boolean;
    observedAt: string;
    deploymentId?: string;
}

export function readObservation(value: unknown): ProductionObservation
{
    const data = object(value);
    const result: ProductionObservation = {
        projectId: text(data.projectId), scriptId: text(data.scriptId), scriptVersion: positive(data.scriptVersion),
        version: text(data.version), commit: text(data.commit), digest: text(data.digest),
        publicationVerified: data.publicationVerified === true, observedAt: text(data.observedAt),
    };
    if (data.deploymentId !== undefined)
    {
        result.deploymentId = text(data.deploymentId);
    }
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(result.projectId) ||
        !/^[A-Za-z0-9_-]{20,}$/.test(result.scriptId) || !Number.isFinite(Date.parse(result.observedAt)))
    {
        throw new Error('RELEASE_VERIFY: Google identity or observation time is invalid. Verify the actual target.');
    }
    return result;
}

/** Only a trusted remote adapter may supply publication evidence. No CLI receipt override exists. */
export function requireObservation(
    event: Extract<ReleaseEvent, { kind: 'candidate' }>, observation: ProductionObservation,
    target: { projectId: string; scriptId: string }, fresh: boolean,
): void
{
    const age = Date.now() - Date.parse(observation.observedAt);
    if (!observation.publicationVerified || observation.projectId !== target.projectId ||
        observation.scriptId !== target.scriptId || observation.version !== event.info.version ||
        observation.commit !== event.info.commit || observation.digest !== event.digest ||
        (fresh && (age < -30_000 || age > 300_000)))
    {
        throw new Error('RELEASE_VERIFY: Publication evidence is missing, stale, or mismatched. Reverify the target.');
    }
}
