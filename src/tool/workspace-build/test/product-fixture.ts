// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 0da7db2d-9f4a-4851-a0cf-79c5ae12f9e6
// Created: 2026
// COMPONENT: Product adapter tests
// PURPOSE: Verify local extension contracts without claiming a Markdown implementation.
// RELATES: specs/product-adapter.md
// FLOW: Create synthetic source -> execute local adapter -> verify artifact or safe failure.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Construct disposable product inputs. This source is never a registered Markdown product. */
export async function productFixture(root: string, browser = false): Promise<string>
{
    const directory = join(root, 'src/extensions/googleworkspace/sample');
    await mkdir(join(directory, 'docs'), { recursive: true });
    await mkdir(join(directory, 'test'), { recursive: true });
    const files: Record<string, string> = {
        'package.json': JSON.stringify({ name: '@outcrop/sample', private: true, type: 'module', version: '0.7.2',
            workspaceExtension: { schemaVersion: 1, callbacks: ['onOpen', 'getInfo'], browser } }),
        'docs/server.ts': 'declare const __BUILD_INFO__: unknown;\n' +
            'export function onOpen(event: unknown)\n{\n    return event;\n}\n' +
            'export function getInfo()\n{\n    return __BUILD_INFO__;\n}\n',
        'docs/appsscript.json': JSON.stringify({ runtimeVersion: 'V8', oauthScopes: [] }),
        'docs/tsconfig.server.json': JSON.stringify({ compilerOptions: { strict: true, noEmit: true,
            target: 'ES2020', types: [], lib: ['ES2020'] }, files: ['server.ts'] }),
        'vitest.config.ts': 'export default {\n    define: { __BUILD_INFO__: "{}" },\n' +
            '    test: { include: ["test/**/*.test.ts"] },\n};',
        'test/server.test.ts': 'import { expect, it } from "vitest";\n' +
            'import { onOpen, getInfo } from "../docs/server.ts";\n' +
            'it("forwards events", () => expect(onOpen("event")).toBe("event"));\n' +
            'it("returns identity", () => expect(getInfo()).toBeDefined());',
    };
    if (browser)
    {
        files['docs/client.ts'] = 'declare const __BUILD_INFO__: unknown;\n' +
            'document.body.textContent = JSON.stringify(__BUILD_INFO__) + "</script><script>bad</script>";';
        files['docs/Index.html'] = '<!doctype html><html><head><!-- STYLE --></head>' +
            '<body><!-- SCRIPT --></body></html>';
        files['docs/style.css'] = 'body { color: black; }';
        files['docs/tsconfig.client.json'] = JSON.stringify({ compilerOptions: { strict: true, noEmit: true,
            target: 'ES2020', types: [], lib: ['ES2020', 'DOM'] }, files: ['client.ts'] });
    }
    for (const [name, content] of Object.entries(files))
    {
        await writeFile(join(directory, name), content);
    }
    await writeFile(join(root, 'workspace.config.json'), JSON.stringify({ schemaVersion: 1, buildProperties: {},
        extensions: [{ name: 'sample', path: 'src/extensions/googleworkspace/sample', state: 'ready' }] }));
    return directory;
}
