// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: ae33a72e-259f-4b34-bad0-884db07ea26e
// Created: 2026
// COMPONENT: Native workspace tooling tests
// PURPOSE: Verify contracts before implementing the local command pipeline.
// RELATES: specs/tooling-implementation.md
// FLOW: Arrange controlled inputs -> execute -> assert outcomes.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { execute } from '../runner.ts';
import { validate } from '../validation.ts';
import { run } from '../process.ts';
import { buildTool, buildFixture } from '../build.ts';
import { packageArtifact } from '../package.ts';
import { readExtensions, loadExtension } from '../config.ts';
import { checkBilling } from '../billing.ts';
import { loadGoogleTarget } from '../google-target.ts';
import { cleanOutput } from '../files.ts';

vi.mock('../process.ts', () => ({ run: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../build.ts', () => ({ buildTool: vi.fn(), buildFixture: vi.fn().mockResolvedValue('/fixture') }));
vi.mock('../package.ts', () => ({ packageArtifact: vi.fn().mockResolvedValue('/package') }));
vi.mock('../config.ts', () => ({ readExtensions: vi.fn(), loadExtension: vi.fn() }));
vi.mock('../files.ts', () => ({ cleanOutput: vi.fn() }));
vi.mock('../release-store.ts', () => ({ readLedger: vi.fn().mockResolvedValue([]) }));
vi.mock('../billing.ts', () => ({ checkBilling: vi.fn().mockResolvedValue({ billingEnabled: false }) }));
vi.mock('../google-target.ts', () => ({ loadGoogleTarget: vi.fn().mockResolvedValue({
    extension: 'markdown', environment: 'prod', projectId: 'outcrop-test-prod', scriptId: null,
}) }));

beforeEach(() =>
{
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.mocked(readExtensions).mockResolvedValue([{ name: 'markdown', state: 'planned', path: 'unused' }]);
    vi.spyOn(console, 'log').mockImplementation(() =>
    {});
});

describe('operation safeguards', () =>
{
    it('allows help without local validation or remote access', async () =>
    {
        await execute(process.cwd(), ['upload', '--help']);
        expect(run).not.toHaveBeenCalled();
    });
    it('blocks configured-looking remote requests before any work', async () =>
    {
        await expect(execute(process.cwd(), ['upload', '--extension', 'markdown', '--environment', 'dev']))
            .rejects.toThrow(/REMOTE_UNCONFIGURED/);
    });
    it('blocks product adapters that do not exist', async () =>
    {
        vi.mocked(loadExtension).mockResolvedValue({ name: 'sample', state: 'ready', path: 'unused' });
        await expect(execute(process.cwd(), ['build', '--extension', 'sample'])).rejects.toThrow(/NOT_READY/);
    });
    it('blocks production until release gates are implemented', async () =>
    {
        await expect(execute(process.cwd(), ['build', '--fixture', '--environment', 'prod']))
            .rejects.toThrow(/RELEASE_NOT_READY/);
    });
    it('does not package planned products', async () =>
    {
        await expect(execute(process.cwd(), ['package'])).rejects.toThrow(/NOT_READY/);
    });
    it('cleans only owned output roots', async () =>
    {
        await execute(process.cwd(), ['clean']);
        expect(vi.mocked(cleanOutput).mock.calls.map(call => call[1])).toEqual(['build', 'dist']);
    });
    it('builds shared tooling independently', async () =>
    {
        await execute(process.cwd(), ['build']);
        expect(buildTool).toHaveBeenCalledOnce();
    });
    it('rejects newly ready products until their build adapter exists', async () =>
    {
        vi.mocked(readExtensions).mockResolvedValue([{ name: 'sample', state: 'ready', path: 'unused' }]);
        await expect(execute(process.cwd(), ['build'])).rejects.toThrow(/NOT_READY/);
    });
    it('builds an explicitly selected fixture', async () =>
    {
        await execute(process.cwd(), ['build', '--fixture']);
        expect(buildFixture).toHaveBeenCalledOnce();
    });
    it('requires every validation step before packaging', async () =>
    {
        await execute(process.cwd(), ['package', '--fixture']);
        expect(vi.mocked(run).mock.calls.length).toBe(8);
        expect(packageArtifact).toHaveBeenCalledOnce();
    });
    it('stops after a failed prerequisite', async () =>
    {
        vi.mocked(run).mockRejectedValueOnce(new Error('lint failed'));
        await expect(execute(process.cwd(), ['package', '--fixture'])).rejects.toThrow('lint failed');
        expect(buildTool).not.toHaveBeenCalled();
    });
    it('does not pass default validation for a ready product without a test adapter', async () =>
    {
        vi.mocked(readExtensions).mockResolvedValue([{ name: 'sample', state: 'ready', path: 'unused' }]);
        await expect(execute(process.cwd(), ['test'])).rejects.toThrow(/NOT_READY/);
    });
    it('routes the public test command through full validation', async () =>
    {
        await execute(process.cwd(), ['test']);
        expect(run).toHaveBeenCalledWith('npm', ['run', 'test:instructions'], process.cwd());
    });
    it('can invoke full validation independently', async () =>
    {
        await validate(process.cwd());
        expect(run).toHaveBeenCalledWith('/bin/bash', ['./configure.sh', '--check'], process.cwd());
    });
});

it('routes billing preflight through a live check using the explicit saved account', async () =>
{
    vi.stubEnv('GOOGLE_ACCOUNT', 'publisher@example.invalid');
    await execute(process.cwd(), ['preflight', '--extension', 'markdown', '--environment', 'prod']);
    expect(loadGoogleTarget).toHaveBeenCalledWith(process.cwd(), 'markdown', 'prod');
    expect(checkBilling).toHaveBeenCalledWith(expect.objectContaining({ projectId: 'outcrop-test-prod' }),
        'publisher@example.invalid');
});
it('inspects a planned extension without pretending that it has production history', async () =>
{
    await execute(process.cwd(), ['release', '--extension', 'markdown']);
    const result = JSON.parse(vi.mocked(console.log).mock.calls.at(-1)![0]);
    expect(result).toMatchObject({ currentProduction: null, events: [] });
});
it('rejects release inspection of an unregistered extension', async () =>
{
    await expect(execute(process.cwd(), ['release', '--extension', 'missing'])).rejects.toThrow(/Unknown extension/);
});
