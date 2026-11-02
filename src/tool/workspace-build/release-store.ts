// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: f8758572-1581-4f5b-ad44-dc8d49aaed7b
// Created: 2026
// COMPONENT: Release persistence
// PURPOSE: Serialize release writers and atomically replace a validated history file.
// RELATES: specs/release-implementation.md
// FLOW: Validate identity and history -> apply one transition -> persist atomically.

import { mkdir, open, readFile, rename, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { rejectLink } from './files.ts';
import { decodeEvent } from './release-event.ts';
import { canonical, object } from './release-data.ts';
import { validateHistory } from './release-state.ts';
import type { ReleaseEvent } from './release-event.ts';

async function directory(root: string, extension: string): Promise<string>
{
    if (!/^[a-z][a-z0-9-]*$/.test(extension))
    {
        throw new Error('RELEASE_PATH: Use a registered lowercase extension name.');
    }
    const path = join(root, 'releases');
    await rejectLink(path);
    return path;
}

/** Missing history is empty. Malformed, oversized, or linked history is an error. */
export async function readLedger(root: string, extension: string): Promise<ReleaseEvent[]>
{
    const path = join(await directory(root, extension), `${extension}.json`);
    await rejectLink(path);
    let content: string;
    try
    {
        if ((await stat(path)).size > 1_048_576)
        {
            throw new Error('RELEASE_DATA: History exceeds the supported size. Plan a reviewed history migration.');
        }
        content = await readFile(path, 'utf8');
    }
    catch (error)
    {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        {
            return [];
        }
        throw error;
    }
    return decodeHistory(JSON.parse(content), extension);
}

function decodeHistory(value: unknown, extension: string): ReleaseEvent[]
{
    const data = object(value);
    if (data.schemaVersion !== 1 || data.extension !== extension || !Array.isArray(data.events))
    {
        throw new Error('RELEASE_DATA: Unsupported or mismatched history. Preserve it for inspection.');
    }
    const events = data.events.map(decodeEvent);
    validateHistory(events);
    if (canonical(value) !== canonical({ schemaVersion: 1, extension, events }))
    {
        throw new Error('RELEASE_DATA: Unexpected history fields. Preserve them for inspection.');
    }
    return events;
}

/** Lock conflicts require investigation. Never delete an existing lock automatically. */
export async function withLedger(
    root: string, extension: string, action: (events: ReleaseEvent[]) => Promise<ReleaseEvent[]>,
): Promise<ReleaseEvent[]>
{
    const base = await directory(root, extension);
    await mkdir(base, { recursive: true });
    const locks = join(base, '.locks');
    await rejectLink(locks);
    await mkdir(locks, { recursive: true });
    const lock = join(locks, extension);
    await acquire(lock);
    try
    {
        const previous = await readLedger(root, extension);
        const events = await action(structuredClone(previous));
        requireAppendOnly(previous, events);
        const decoded = decodeHistory({ schemaVersion: 1, extension, events }, extension);
        await save(base, extension, decoded);
        return decoded;
    }
    finally
    {
        await rm(lock, { recursive: true });
    }
}

function requireAppendOnly(previous: ReleaseEvent[], events: ReleaseEvent[]): void
{
    if (canonical(previous) !== canonical(events.slice(0, previous.length)))
    {
        throw new Error('RELEASE_HISTORY: Updates must append events without changing saved history.');
    }
}

async function acquire(path: string): Promise<void>
{
    try
    {
        await mkdir(path);
    }
    catch
    {
        throw new Error('RELEASE_LOCK: Cannot acquire release lock. Inspect another writer or interrupted operation.');
    }
}

async function save(base: string, extension: string, events: ReleaseEvent[]): Promise<void>
{
    const path = join(base, `${extension}.json`);
    await rejectLink(path);
    const temporary = join(base, `.release-tmp-${randomUUID()}`);
    const handle = await open(temporary, 'wx', 0o644);
    try
    {
        try
        {
            await handle.writeFile(JSON.stringify({ schemaVersion: 1, extension, events }, null, 4) + '\n');
            await handle.sync();
        }
        finally
        {
            await handle.close();
        }
        await rename(temporary, path);
    }
    finally
    {
        await rm(temporary, { force: true });
    }
}
