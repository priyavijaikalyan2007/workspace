// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 81c78e87-f354-4e2a-a3c8-075d557d6847
// Created: 2026
// COMPONENT: Disposable Docs input experiment
// PURPOSE: Test activation, input observation, redaction, and cleanup before host use.
// RELATES: specs/markdown-input-experiment.md
// FLOW: Validate test target -> observe bounded metrics -> remove listeners.

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const url = 'https://docs.google.com/document/d/1_pTvhF7saa5RKLlC7cQbbzeM-XKvO_y_Fkfx8jC4MKI/edit?tab=t.0';
const modulePath = './probe.js';
let documentTarget: Document;

/** Build only the browser facilities this probe is allowed to read. */
function fakeDocument(location = url, frames: unknown[] = []): Document
{
    return Object.assign(new EventTarget(), {
        URL: location,
        querySelectorAll: () => frames,
        getSelection: () => ({ toString: () => 'MD_PROBE_ALPHA' }),
    }) as unknown as Document;
}

/** Deliver a synthetic input event without a real browser or document mutation. */
function input(type: string, fields: Record<string, unknown> = {}, targetDocument = documentTarget): void
{
    const event = new Event(type);
    Object.assign(event, fields);
    Object.defineProperty(event, 'target', { value: {
        tagName: 'TEXTAREA', value: 'MD_PROBE_ALPHA', textContent: '',
    } });
    targetDocument.dispatchEvent(event);
}

beforeEach(() =>
{
    vi.resetModules();
    vi.useFakeTimers();
    vi.stubGlobal('__outcropDocsProbe', undefined);
    documentTarget = fakeDocument();
    vi.stubGlobal('document', documentTarget);
});
afterEach(() =>
{
    globalThis.__outcropDocsProbe?.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

it('rejects another document before attaching any listeners', async () =>
{
    vi.stubGlobal('document', fakeDocument('https://docs.google.com/document/d/another/edit'));
    await expect(import(modulePath)).rejects.toThrow(/PROBE_TARGET/);
    expect(globalThis.__outcropDocsProbe).toBeUndefined();
});
it('observes committed backtick input and source-access metrics', async () =>
{
    await import(modulePath);
    input('input', { data: '`', inputType: 'insertText', isComposing: false });
    expect(globalThis.__outcropDocsProbe?.report().samples[0]).toMatchObject({
        event: 'input', committedDelimiter: true, composing: false,
        targetHasSentinel: true, selectionHasSentinel: true,
    });
});
it('does not treat a composing backtick as a completed delimiter', async () =>
{
    await import(modulePath);
    input('input', { data: '`', inputType: 'insertCompositionText', isComposing: true });
    expect(globalThis.__outcropDocsProbe?.report().samples[0]?.committedDelimiter).toBe(false);
});
it('treats a composition end containing a backtick as committed input', async () =>
{
    await import(modulePath);
    input('compositionend', { data: '`', isComposing: false });
    expect(globalThis.__outcropDocsProbe?.report().samples[0]?.committedDelimiter).toBe(true);
});
it('reports a delimiter key without claiming a committed text edit', async () =>
{
    await import(modulePath);
    input('keydown', { key: '`' });
    expect(globalThis.__outcropDocsProbe?.report().samples[0]).toMatchObject({
        key: '`', committedDelimiter: false,
    });
});
it('does not record ordinary character keys or clipboard contents', async () =>
{
    await import(modulePath);
    input('keydown', { key: 'private-character' });
    input('paste', { clipboardData: { getData: () =>
    {
        throw new Error('Must not read clipboard');
    } } });
    const report = globalThis.__outcropDocsProbe?.report();
    expect(report?.samples).toHaveLength(1);
    expect(JSON.stringify(report)).not.toContain('private-character');
});
it('attaches to reachable same-origin frames', async () =>
{
    const child = fakeDocument('about:blank');
    vi.stubGlobal('document', fakeDocument(url, [{ contentDocument: child }]));
    await import(modulePath);
    input('input', { data: '`' }, child);
    expect(globalThis.__outcropDocsProbe?.report()).toMatchObject({ documents: 2,
        samples: [expect.objectContaining({ committedDelimiter: true })] });
});
it('reports inaccessible frames without reading their content', async () =>
{
    const blocked = { get contentDocument(): Document
    {
        throw new Error('Cross-origin frame');
    } };
    vi.stubGlobal('document', fakeDocument(url, [blocked]));
    await import(modulePath);
    expect(globalThis.__outcropDocsProbe?.report().blockedFrames).toBe(1);
});
it('bounds retained event metrics', async () =>
{
    await import(modulePath);
    for (let i = 0; i < 100; i++)
    {
        input('input', { data: '`' });
    }
    expect(globalThis.__outcropDocsProbe?.report().samples).toHaveLength(64);
});
it('removes every input listener when stopped', async () =>
{
    await import(modulePath);
    globalThis.__outcropDocsProbe?.stop();
    input('input', { data: '`' });
    expect(globalThis.__outcropDocsProbe?.report()).toMatchObject({ active: false, samples: [] });
});
it('expires after five minutes', async () =>
{
    await import(modulePath);
    vi.advanceTimersByTime(300000);
    input('input', { data: '`' });
    expect(globalThis.__outcropDocsProbe?.report()).toMatchObject({ active: false, samples: [] });
});
it('stops recording when the page changes to another document', async () =>
{
    await import(modulePath);
    Object.assign(documentTarget, { URL: 'https://docs.google.com/document/d/another/edit' });
    input('input', { data: '`' });
    expect(globalThis.__outcropDocsProbe?.report()).toMatchObject({ active: false, samples: [] });
});
it('replaces an earlier probe without leaving duplicate listeners', async () =>
{
    await import(modulePath);
    const previous = globalThis.__outcropDocsProbe;
    vi.resetModules();
    await import(modulePath);
    input('input', { data: '`' });
    expect(previous?.report().active).toBe(false);
    expect(globalThis.__outcropDocsProbe?.report().samples).toHaveLength(1);
});
it('returns copies so report consumers cannot alter retained samples', async () =>
{
    await import(modulePath);
    input('input', { data: '`' });
    globalThis.__outcropDocsProbe?.report().samples.splice(0);
    expect(globalThis.__outcropDocsProbe?.report().samples).toHaveLength(1);
});

it('preserves an unrelated diagnostic that already occupies the global name', async () =>
{
    const foreign = { signature: 'another-tool', stop: vi.fn() };
    vi.stubGlobal('__outcropDocsProbe', foreign);
    await expect(import(modulePath)).rejects.toThrow(/PROBE_CONFLICT/);
    expect(globalThis.__outcropDocsProbe).toBe(foreign);
});
it('counts an unavailable frame without assuming its source is readable', async () =>
{
    vi.stubGlobal('document', fakeDocument(url, [{ contentDocument: null }]));
    await import(modulePath);
    expect(globalThis.__outcropDocsProbe?.report().blockedFrames).toBe(1);
});
it('does not attach duplicate listeners through a cyclic frame reference', async () =>
{
    Object.assign(documentTarget, { querySelectorAll: () => [{ contentDocument: documentTarget }] });
    await import(modulePath);
    input('input', { data: '`' });
    expect(globalThis.__outcropDocsProbe?.report()).toMatchObject({ documents: 1,
        samples: [expect.objectContaining({ committedDelimiter: true })] });
});
it('reports absent source and selection without inventing a readable range', async () =>
{
    Object.assign(documentTarget, { getSelection: () => null });
    await import(modulePath);
    const event = new Event('beforeinput');
    Object.assign(event, { data: '`', getTargetRanges: () => [] });
    Object.defineProperty(event, 'target', { value: { tagName: 'DIV', textContent: '' } });
    documentTarget.dispatchEvent(event);
    expect(globalThis.__outcropDocsProbe?.report().samples[0]).toMatchObject({
        committedDelimiter: false, targetLength: 0, targetHasSentinel: false,
        selectionLength: 0, selectionHasSentinel: false, targetRangeCount: 0,
    });
});
it('stops recursion at the document cap', async () =>
{
    const chain = Array.from({ length: 20 }, () => fakeDocument('about:blank'));
    chain.unshift(documentTarget);
    for (let i = 0; i < chain.length - 1; i++)
    {
        Object.assign(chain[i]!, { querySelectorAll: () => [{ contentDocument: chain[i + 1] }] });
    }
    await import(modulePath);
    expect(globalThis.__outcropDocsProbe?.report().documents).toBe(16);
});
