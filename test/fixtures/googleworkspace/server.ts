// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 382ed01a-c3b7-4cb1-86f8-e657d43ab323
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Expose a harmless callback solely for local artifact verification.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

declare const __BUILD_INFO__: Readonly<Record<string, unknown>>;

/** Google callback shim must preserve this export when esbuild bundles modules. */
export function info(): Readonly<Record<string, unknown>>
{
    return __BUILD_INFO__;
}
