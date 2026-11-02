// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 43865668-87cc-40bb-89bb-e10a6aab1430
// Created: 2026
// COMPONENT: Release persistence tests
// PURPOSE: Verify release integrity using real temporary Git and filesystem state.
// RELATES: specs/release-implementation.md
// FLOW: Arrange isolated source -> attempt release operation -> verify durable state.

import { expect, it } from 'vitest';
import { decodeEvent } from '../release-event.ts';
import { validateHistory } from '../release-state.ts';
import { createBuildInfo } from '../version.ts';
import { canonical, digest, hashes, object, text } from '../release-data.ts';
import { readObservation } from '../observation.ts';
import { formatDiagnostics } from '../diagnostics.ts';

const info = createBuildInfo({ version: '1.0.0', commit: 'a'.repeat(40), dirty: false,
    clock: new Date('2026-11-02T00:00:00Z'), environment: 'prod', sequence: 1 });
const files = { 'Code.gs': 'a'.repeat(64) };
const event = { id: '00000000-0000-4000-8000-000000000001', at: info.builtAt,
    kind: 'candidate', info, files, digest: digest(files) };

it.each([null, [], 4])('rejects non-object release data %j', value =>
{
    expect(() => object(value)).toThrow();
});
it.each(['', 9, 'a'.repeat(513)])('rejects invalid public text %j', value =>
{
    expect(() => text(value)).toThrow();
});
it.each([{}, { '../escape': 'a'.repeat(64) }, { 'Code.gs': 'invalid' }])('rejects invalid file hashes %j', value =>
{
    expect(() => hashes(value)).toThrow();
});
it.each([
    { ...event, id: 'invalid' }, { ...event, at: 'invalid' }, { ...event, kind: 'unknown' },
    { ...event, secret: 'must not persist' }, { ...event, digest: 'b'.repeat(64) },
    { ...event, info: { ...info, dirty: true } }, { ...event, info: { ...info, releaseSequence: 0 } },
])('rejects corrupt event %j', value =>
{
    expect(() => decodeEvent(value)).toThrow();
});
it('rejects duplicate event IDs', () =>
{
    const decoded = decodeEvent(event);
    expect(() => validateHistory([decoded, decoded])).toThrow(/Duplicate/);
});
it('rejects non-monotonic candidate sequence', () =>
{
    const invalid = decodeEvent({ ...event, info: { ...info, releaseSequence: 2 } });
    expect(() => validateHistory([invalid])).toThrow(/sequence/);
});
it('rejects an unknown candidate reference', () =>
{
    const failure = decodeEvent({ id: event.id, at: event.at, kind: 'failed',
        candidateId: 'unknown', reasonCode: 'BUILD_FAILED' });
    expect(() => validateHistory([failure])).toThrow(/does not exist/);
});
it('rejects malformed Google target IDs', () =>
{
    expect(() => readObservation({ projectId: 'bad', scriptId: 'x', scriptVersion: 1,
        version: info.version, commit: info.commit, digest: event.digest,
        publicationVerified: true, observedAt: info.builtAt })).toThrow();
});
it('preserves a separate deployment ID in observation', () =>
{
    expect(readObservation({ projectId: 'outcrop-sample-prod', scriptId: 'A'.repeat(48), scriptVersion: 1,
        version: info.version, commit: info.commit, digest: event.digest, deploymentId: 'deployment-1',
        publicationVerified: true, observedAt: info.builtAt }).deploymentId).toBe('deployment-1');
});
it('reports development dirty state without inventing a production sequence', () =>
{
    const development = createBuildInfo({ version: '0.1.0', commit: info.commit, dirty: true,
        clock: new Date(info.builtAt), environment: 'dev' });
    expect(formatDiagnostics('fixture', development)).toContain('Dirty source: yes');
    expect(formatDiagnostics('fixture', development)).toContain('Production release sequence: none');
});

it('uses code-point key order so artifact digests do not depend on the operating-system locale', () =>
{
    expect(canonical({ a: 1, A: 2, _: 3 })).toBe('{"A":2,"_":3,"a":1}');
});
