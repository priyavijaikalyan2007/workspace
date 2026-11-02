// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: b47f3c86-9920-4dfd-898f-7acf747ab3a5
// Created: 2026
// COMPONENT: Release persistence tests
// PURPOSE: Verify release integrity using real temporary Git and filesystem state.
// RELATES: specs/release-implementation.md
// FLOW: Arrange isolated source -> attempt release operation -> verify durable state.

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { requireUnbilled, checkBilling } from '../billing.ts';
import { loadGoogleTarget } from '../google-target.ts';

const projectId = 'outcrop-sample-dev';
const safe = { projectId, name: `projects/${projectId}/billingInfo`, billingEnabled: false, billingAccountName: '' };
const target = { extension: 'sample', environment: 'dev' as const, projectId,
    projectNumber: '123456789012', scriptId: null };
let root: string;
beforeEach(async () =>
{
    root = await mkdtemp(join(tmpdir(), 'outcrop billing '));
});
afterEach(async () =>
{
    await rm(root, { recursive: true, force: true });
});

describe('live billing boundary', () =>
{
    it('accepts only an explicitly disabled and unlinked project', () =>
    {
        expect(requireUnbilled(safe, projectId))
            .toMatchObject({ projectId, billingEnabled: false, billingAccountName: '' });
    });
    it.each([
        null, {}, { ...safe, billingEnabled: true }, { ...safe, billingAccountName: 'billingAccounts/linked' },
        { projectId, billingEnabled: false }, { ...safe, projectId: 'other-project' },
        { ...safe, name: 'projects/other-project/billingInfo' }, { ...safe, billingEnabled: 'false' },
    ])('blocks unknown, enabled, linked, or mismatched billing %j', value =>
    {
        expect(() => requireUnbilled(value, projectId)).toThrow(/BILLING/);
    });
    it('uses a live command with explicit identity rather than saved billing properties', async () =>
    {
        const execute = vi.fn().mockResolvedValue(JSON.stringify(safe));
        await checkBilling(target, 'publisher@example.invalid', execute);
        expect(execute).toHaveBeenCalledWith('gcloud', [
            'billing', 'projects', 'describe', projectId,
            '--account=publisher@example.invalid', '--format=json', '--quiet',
        ]);
    });
    it('excludes raw failure output from diagnostics', async () =>
    {
        const execute = vi.fn().mockRejectedValue(new Error('Bearer private-token and private content'));
        await expect(checkBilling(target, 'publisher@example.invalid', execute))
            .rejects.toThrow(/BILLING_UNVERIFIED/);
        await expect(checkBilling(target, 'publisher@example.invalid', execute)).rejects.not.toThrow(/private-token/);
    });
    it('blocks malformed command output', async () =>
    {
        await expect(checkBilling(target, 'publisher@example.invalid', async () => 'not JSON'))
            .rejects.toThrow(/BILLING_UNVERIFIED/);
    });
    it('requires an explicit saved account selection', async () =>
    {
        await expect(checkBilling(target, '', vi.fn())).rejects.toThrow(/account/i);
    });
});

async function config(google: unknown): Promise<void>
{
    await writeFile(join(root, 'workspace.config.json'), JSON.stringify({ schemaVersion: 1,
        extensions: [{ name: 'sample', path: 'src/extensions/googleworkspace/sample', state: 'planned', google }] }));
}
const targets = { dev: { projectId, projectNumber: '123456789012', scriptId: null },
    prod: { projectId: 'outcrop-sample-prod', projectNumber: '234567890123', scriptId: null } };

describe('Google environment ownership', () =>
{
    it('permits billing inspection before product implementation', async () =>
    {
        await config(targets);
        expect(await loadGoogleTarget(root, 'sample', 'dev')).toEqual(target);
    });
    it('preserves a configured script identifier without treating it as a credential', async () =>
    {
        const scriptId = 'A'.repeat(48);
        await config({ ...targets, dev: { ...targets.dev, scriptId } });
        expect((await loadGoogleTarget(root, 'sample', 'dev')).scriptId).toBe(scriptId);
    });
    it('rejects unknown extensions', async () =>
    {
        await config(targets);
        await expect(loadGoogleTarget(root, 'missing', 'dev')).rejects.toThrow();
    });
    it.each([
        undefined, { ...targets, dev: { ...targets.dev, projectId: null } },
        { ...targets, prod: targets.dev },
        { ...targets, dev: { ...targets.dev, projectId: '../escape' } },
        { ...targets, dev: { ...targets.dev, projectNumber: 'unknown' } },
        { dev: { ...targets.dev, scriptId: 'A'.repeat(48) }, prod: { ...targets.prod, scriptId: 'A'.repeat(48) } },
    ])('blocks unconfigured, shared, or malformed targets %j', async value =>
    {
        await config(value);
        await expect(loadGoogleTarget(root, 'sample', 'dev')).rejects.toThrow();
    });
});
