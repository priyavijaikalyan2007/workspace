// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: c92db6dc-a371-4a98-97b6-a92b1cb64ad1
// Created: 2026
// COMPONENT: Native workspace tooling tests
// PURPOSE: Verify contracts before implementing the local command pipeline.
// RELATES: specs/tooling-implementation.md
// FLOW: Arrange controlled inputs -> execute -> assert outcomes.

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/tool/workspace-build/test/**/*.test.ts', 'test/experiments/docs-input/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/tool/workspace-build/*.ts', 'test/experiments/docs-input/probe.js'],
            exclude: ['src/tool/workspace-build/cli.ts'],
            thresholds: { lines: 90, functions: 90, branches: 80, statements: 90,
                'test/experiments/docs-input/probe.js': { lines: 90, functions: 90, branches: 80, statements: 90 } },
        },
    },
});
