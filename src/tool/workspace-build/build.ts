// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: ebf1acab-ef13-4fb4-9f05-966db04133d2
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Build an explicitly non-deployable fixture through separate Apps Script and browser bundles.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { claimOutput, rejectLink } from './files.ts';
import type { BuildInfo } from './version.ts';

/** Bundle a controlled fixture. This is packaging evidence, not a built product extension. */
export async function buildFixture(project: string, outputRoot: string, info: BuildInfo): Promise<string>
{
    const base = join(project, 'test/fixtures/googleworkspace');
    const output = join(await claimOutput(outputRoot, 'build'), 'fixture');
    await rejectLink(output);
    await mkdir(output, { recursive: true });
    const runtime = join(output, 'apps-script');
    await rejectLink(runtime);
    await mkdir(runtime, { recursive: true });
    const server = await bundle(join(base, 'server.ts'), info, 'neutral');
    const browser = await bundle(join(base, 'client.ts'), info, 'browser');
    const html = await readFile(join(base, 'Index.html'), 'utf8');
    const css = await readFile(join(base, 'style.css'), 'utf8');
    await writeRuntime(runtime, 'Code.gs', `${server}\nfunction fixtureInfo() { return OutcropFixture.info(); }\n`);
    await writeRuntime(runtime, 'Index.html', html.replace('<!-- STYLE -->', `<style>${css}</style>`)
        .replace('<!-- SCRIPT -->', `<script>${browser.replace(/<\/script/gi, '<\\/script')}</script>`));
    await writeRuntime(runtime, 'appsscript.json', await readFile(join(base, 'appsscript.json'), 'utf8'));
    await rejectLink(join(output, 'build-info.json'));
    await writeFile(join(output, 'build-info.json'), JSON.stringify(info, null, 4) + '\n');
    return output;
}

async function bundle(entry: string, info: BuildInfo, platform: 'browser' | 'neutral'): Promise<string>
{
    const result = await build({
        entryPoints: [entry], bundle: true, write: false, format: 'iife', globalName: 'OutcropFixture',
        platform, target: 'es2020', define: { __BUILD_INFO__: JSON.stringify(info) },
        sourcemap: false, legalComments: 'inline',
    });
    return result.outputFiles[0]!.text;
}

async function writeRuntime(root: string, name: string, content: string): Promise<void>
{
    await rejectLink(join(root, name));
    await writeFile(join(root, name), content);
}

/** Compile the shared tool independently from any planned product extension. */
export async function buildTool(root: string): Promise<string>
{
    const output = join(await claimOutput(root, 'build'), 'tooling');
    await rejectLink(output);
    await mkdir(output, { recursive: true });
    await rejectLink(join(output, 'cli.mjs'));
    await build({ entryPoints: [join(root, 'src/tool/workspace-build/cli.ts')],
        outfile: join(output, 'cli.mjs'), bundle: true, platform: 'node', format: 'esm',
        packages: 'external', target: 'node26', sourcemap: false });
    return output;
}
