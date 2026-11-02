// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 266e7541-2bba-4609-bac2-d8e525545e86
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Decode immutable candidate and deployment events without accepting unexpected fields.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { canonical, digest, hashes, object, positive, text } from './release-data.ts';
import { readObservation } from './observation.ts';
import { createBuildInfo } from './version.ts';
import type { BuildInfo } from './version.ts';
import type { ProductionObservation } from './observation.ts';

export type ReleaseEvent = { id: string; at: string } & (
    { kind: 'candidate'; info: BuildInfo; files: Record<string, string>; digest: string } |
    { kind: 'failed'; candidateId: string; reasonCode: string } |
    { kind: 'production' | 'rollback'; candidateId: string; observation: ProductionObservation }
);

export function decodeEvent(value: unknown): ReleaseEvent
{
    const data = object(value);
    const common = { id: text(data.id), at: text(data.at) };
    if (!/^[a-f0-9-]{36}$/.test(common.id) || !Number.isFinite(Date.parse(common.at)))
    {
        throw new Error('RELEASE_DATA: Invalid event identity or time. Inspect history without rewriting it.');
    }
    const result = decodeDetails(data, common);
    if (canonical(value) !== canonical(result))
    {
        throw new Error('RELEASE_DATA: Unexpected or inconsistent event fields. Inspect the saved record.');
    }
    return result;
}

function decodeDetails(data: Record<string, unknown>, common: { id: string; at: string }): ReleaseEvent
{
    if (data.kind === 'candidate')
    {
        const files = hashes(data.files);
        return { ...common, kind: 'candidate', info: decodeInfo(data.info), files, digest: digest(files) };
    }
    if (data.kind === 'failed')
    {
        const reasonCode = text(data.reasonCode);
        if (!/^[A-Z][A-Z0-9_]{2,63}$/.test(reasonCode))
        {
            throw new Error('RELEASE_DATA: Use a public failure code, not private error content.');
        }
        return { ...common, kind: 'failed', candidateId: text(data.candidateId), reasonCode };
    }
    if (data.kind === 'production' || data.kind === 'rollback')
    {
        return { ...common, kind: data.kind, candidateId: text(data.candidateId),
            observation: readObservation(data.observation) };
    }
    throw new Error('RELEASE_DATA: Unknown event kind. Do not rewrite an unsupported history.');
}

function decodeInfo(value: unknown): BuildInfo
{
    const data = object(value);
    const version = text(data.version);
    const info = createBuildInfo({ version: version.split('+')[0]!, commit: text(data.commit),
        dirty: false, environment: 'prod', clock: new Date(text(data.builtAt)),
        buildNumber: text(data.buildNumber), sequence: positive(data.releaseSequence) });
    if (canonical(value) !== canonical(info))
    {
        throw new Error('RELEASE_DATA: Candidate identity is inconsistent or not clean production source.');
    }
    return info;
}
