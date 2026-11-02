// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 0ab8136b-0a32-4d5a-bf6a-36343b77ee29
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Format safe issue diagnostics from the running artifact rather than mutable latest state.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import type { BuildInfo } from './version.ts';

/** Explicit field selection excludes caller extras such as document text, paths, and tokens. */
export function formatDiagnostics(extension: string, info: BuildInfo): string
{
    return [
        `Extension: ${extension}`, `Version: ${info.version}`,
        `Production release sequence: ${info.releaseSequence ?? 'none'}`,
        `Build number: ${info.buildNumber}`, `Source commit: ${info.commit}`,
        `Built at (UTC): ${info.builtAt}`, `Environment: ${info.environment}`,
        `Dirty source: ${info.dirty ? 'yes' : 'no'}`,
    ].join('\n');
}
