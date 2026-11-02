// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: d7a7595e-1d35-44da-8988-ee08ee47981c
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Validate release transitions and preserve the original identity during rollback.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { gt, major, minor, patch } from 'semver';
import { requireObservation } from './observation.ts';
import type { ReleaseEvent } from './release-event.ts';

export function findCandidate(events: ReleaseEvent[], id: string): Extract<ReleaseEvent, { kind: 'candidate' }>
{
    const event = events.find(item => item.id === id);
    if (!event || event.kind !== 'candidate')
    {
        throw new Error('RELEASE_STATE: Candidate does not exist. Inspect the release history.');
    }
    return event;
}

export function currentProduction(events: ReleaseEvent[]): string | undefined
{
    const current = events.filter(event => event.kind === 'production' || event.kind === 'rollback').at(-1);
    return current && current.kind !== 'candidate' ? current.candidateId : undefined;
}

export function nextSequence(events: ReleaseEvent[]): number
{
    return events.filter(event => event.kind === 'candidate').length + 1;
}

export function activeCandidate(events: ReleaseEvent[]): string | undefined
{
    const last = events.at(-1);
    return last?.kind === 'candidate' ? last.id : undefined;
}

/** Replay every event. A corrupt old transition blocks new writes instead of hiding history. */
export function validateHistory(events: ReleaseEvent[]): void
{
    const previous: ReleaseEvent[] = [];
    for (const event of events)
    {
        if (previous.some(item => item.id === event.id))
        {
            throw new Error('RELEASE_STATE: Duplicate event identity. Inspect history.');
        }
        validateTransition(previous, event);
        previous.push(event);
    }
}

function validateTransition(previous: ReleaseEvent[], event: ReleaseEvent): void
{
    if (event.kind === 'candidate')
    {
        requireCandidateSlot(previous, event.info.version);
        if (event.info.releaseSequence !== nextSequence(previous))
        {
            throw new Error('RELEASE_STATE: Candidate sequence was reused or skipped. Inspect history.');
        }
        return;
    }
    const candidate = findCandidate(previous, event.candidateId);
    if (event.kind !== 'rollback' && activeCandidate(previous) !== event.candidateId)
    {
        throw new Error('RELEASE_STATE: Only the active candidate can resolve. Inspect history.');
    }
    if (event.kind === 'rollback' && (activeCandidate(previous) || currentProduction(previous) === event.candidateId ||
        !previous.some(item => item.kind === 'production' && item.candidateId === event.candidateId)))
    {
        throw new Error('RELEASE_STATE: Rollback requires a different previously verified production artifact.');
    }
    if (event.kind === 'production' || event.kind === 'rollback')
    {
        requireObservation(candidate, event.observation, event.observation, false);
    }
}

export function requireCandidateSlot(events: ReleaseEvent[], version: string): void
{
    if (activeCandidate(events))
    {
        throw new Error('RELEASE_STATE: Resolve the active candidate before starting another release.');
    }
    if (events.some(event => event.kind === 'candidate' && event.info.version === version))
    {
        throw new Error('RELEASE_STATE: Full version already exists. Use a new build identity.');
    }
    for (const event of events.filter(item => item.kind === 'production'))
    {
        if (event.kind !== 'production')
        {
            continue;
        }
        const previous = findCandidate(events, event.candidateId).info.version;
        requireVersionAdvance(previous, version);
    }
}

function requireVersionAdvance(previous: string, next: string): void
{
    if (!gt(next, previous) || (major(next) > major(previous) && (minor(next) !== 0 || patch(next) !== 0)) ||
        (major(next) === major(previous) && minor(next) > minor(previous) && patch(next) !== 0))
    {
        throw new Error('RELEASE_VERSION: Advance the core and reset lower fields after a major or minor bump.');
    }
}
