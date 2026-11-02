// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 86ee60fd-4b55-48c2-9736-62da0e34268a
// Created: 2026
// COMPONENT: Native workspace tooling tests
// PURPOSE: Verify contracts before implementing the local command pipeline.
// RELATES: specs/tooling-implementation.md
// FLOW: Arrange controlled inputs -> execute -> assert outcomes.

import { describe, expect, it } from 'vitest';
import { parseArguments } from '../args.ts';
import { createBuildInfo } from '../version.ts';
import { loadExtension } from '../config.ts';

const commit = 'a'.repeat(40);
const clock = new Date('2026-11-01T14:30:00Z');

// ANCHOR: argument-boundary
// Public operations must reject ambiguous input before touching output or remote services.
describe('command arguments', () =>
{
    it('selects all enabled extensions for an ordinary local build', () =>
    {
        expect(parseArguments(['build']).extension).toBeUndefined();
    });
    it.each([
        ['unknown'], ['build', '--unknown'], ['build', '--extension'],
        ['build', '--extension', '../other'], ['build', '--fixture', '--extension', 'markdown'],
        ['upload'], ['deploy', '--extension', 'markdown'],
        ['publish', '--extension', 'markdown', '--environment', 'other'],
        ['build', '--fixture', '--fixture'], ['clean', '--version', '1.0.0'],
        ['clean', '--fixture'], ['test', '--environment', 'prod'],
    ])('rejects invalid command %j', (...args) =>
    {
        expect(() => parseArguments(args)).toThrow();
    });
    it('accepts explicit remote destinations', () =>
    {
        expect(parseArguments(['upload', '--extension', 'markdown', '--environment', 'dev']))
            .toMatchObject({ operation: 'upload', extension: 'markdown', environment: 'dev' });
    });
    it('returns help without requiring remote destinations', () =>
    {
        expect(parseArguments(['publish', '--help']).help).toBe(true);
    });
});

describe('embedded build identity', () =>
{
    const input = { version: '1.2.3', commit, dirty: false, clock, environment: 'dev' as const };
    it('uses UTC when no build number is supplied', () =>
    {
        expect(createBuildInfo(input).version).toBe('1.2.3-dev+202611011430.gaaaaaaa');
    });
    it('uses a build property when no environment override is supplied', () =>
    {
        expect(createBuildInfo({ ...input, buildProperty: 'property.42' }).buildNumber).toBe('property.42');
    });
    it('uses an environment override before a build property', () =>
    {
        expect(createBuildInfo({ ...input, buildProperty: 'property.42', buildNumber: 'ci.88' }).buildNumber)
            .toBe('ci.88');
    });
    it('records the actual full source commit', () =>
    {
        expect(createBuildInfo({ ...input, buildNumber: '77', dirty: true })).toMatchObject({
            version: '1.2.3-dev+77.gaaaaaaa.dirty', commit, dirty: true,
        });
    });
    it.each(['', 'one two', 'a/b'])('rejects invalid build identifier %j', (buildNumber) =>
    {
        expect(() => createBuildInfo({ ...input, buildNumber })).toThrow();
    });
    it('preserves leading zeros in a valid SemVer build identifier', () =>
    {
        expect(createBuildInfo({ ...input, buildNumber: '007' }).buildNumber).toBe('007');
    });
    it('rejects a dirty production source', () =>
    {
        expect(() => createBuildInfo({ ...input, environment: 'prod', dirty: true })).toThrow();
    });
    it('requires a production release sequence', () =>
    {
        expect(() => createBuildInfo({ ...input, environment: 'prod' })).toThrow();
    });
    it('creates stable SemVer for a clean production release', () =>
    {
        expect(createBuildInfo({ ...input, environment: 'prod', sequence: 8 }).version)
            .toBe('1.2.3+202611011430.gaaaaaaa');
    });
    it.each(['1.2', 'v1.2.3', '1.2.3-beta', '1.2.3+old'])('rejects invalid core %s', (version) =>
    {
        expect(() => createBuildInfo({ ...input, version })).toThrow();
    });
    it('rejects fabricated source identity', () =>
    {
        expect(() => createBuildInfo({ ...input, commit: 'uncommitted' })).toThrow();
    });
});

describe('product readiness', () =>
{
    it('reports the planned Markdown add-on instead of treating it as implemented', async () =>
    {
        await expect(loadExtension(process.cwd(), 'markdown')).rejects.toThrow(/planned/i);
    });
    it('rejects unknown extension names', async () =>
    {
        await expect(loadExtension(process.cwd(), 'missing')).rejects.toThrow(/unknown/i);
    });
});
