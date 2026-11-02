// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 021d9b50-54f8-46f9-93ac-63be32a30ee3
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Read source identity from Git rather than injected labels.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export interface SourceState
{
    commit: string;
    dirty: boolean;
}

const exec = promisify(execFile);

/** Include tracked and untracked source changes. Ignore generated outputs through repository rules. */
export async function readSourceState(root: string): Promise<SourceState>
{
    const commit = (await exec('git', ['rev-parse', 'HEAD'], { cwd: root })).stdout.trim();
    const status = (await exec('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root })).stdout;
    return { commit, dirty: status.length > 0 };
}
