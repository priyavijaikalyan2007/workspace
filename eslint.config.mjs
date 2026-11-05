// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: a420f1c7-dfe3-4a64-876e-d5d42433322a
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Enforce the agreed TypeScript conventions across tooling and its tests.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default ts.config(
    js.configs.recommended,
    ts.configs.recommended,
    {
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/brace-style': ['error', 'allman'],
            '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
            'curly': ['error', 'all'],
            'max-len': ['error', { code: 120, ignoreUrls: true }],
            'max-depth': ['error', 3],
            'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true, IIFEs: true }],
        },
    },
    { files: ['**/test/**/*.ts'], rules: { 'max-lines-per-function': 'off' } },
    { files: ['test/experiments/docs-input/probe.js'], languageOptions: { globals: {
        setTimeout: 'readonly', clearTimeout: 'readonly',
    } } },
);
