// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: cbc06c5b-63b1-41ab-8e51-bbdcc156e54b
// Created: 2026
// COMPONENT: Disposable Docs input experiment
// PURPOSE: Observe bounded event and source-access metrics in one synthetic document without writes or network calls.
// RELATES: specs/markdown-input-experiment.md
// FLOW: Validate exact target -> attach temporary listeners -> inspect metrics -> stop or expire.

'use strict';

{
    const DOCUMENT_ID = '1_pTvhF7saa5RKLlC7cQbbzeM-XKvO_y_Fkfx8jC4MKI';
    const TARGET = `https://docs.google.com/document/d/${DOCUMENT_ID}/edit`;
    const SIGNATURE = 'outcrop-docs-input-probe-v1';
    const SENTINEL = 'MD_PROBE_ALPHA';
    const MAX_SAMPLES = 64;
    const MAX_DOCUMENTS = 16;
    const EXPIRY_MS = 300000;
    const EVENTS = ['keydown', 'beforeinput', 'input', 'compositionend', 'paste'];
    const KEYS = ['`', 'Enter', 'Backspace', 'Delete'];
    const rootDocument = globalThis.document;
    /** @type {Document[]} Reachable frames are kept only for listener removal. */
    const documents = [];
    /** @type {ProbeSample[]} Samples contain lengths and sentinel matches, never document content. */
    const samples = [];
    let active = true;
    let blockedFrames = 0;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timer;

    /** Limit all observation to the exact disposable document, including later page navigation. */
    function isTarget()
    {
        return rootDocument?.URL.split(/[?#]/)[0] === TARGET;
    }

    /** Remove all handlers without changing any editor state. Metrics remain available for inspection. */
    function stop()
    {
        active = false;
        clearTimeout(timer);
        for (const doc of documents)
        {
            for (const type of EVENTS)
            {
                doc.removeEventListener(type, observe, true);
            }
        }
    }

    /** Return owned copies so callers cannot alter the retained metrics. */
    function report()
    {
        return { active, documents: documents.length, blockedFrames, samples: samples.map(sample => ({ ...sample })) };
    }

    /** Record only relevant input metadata. Ordinary character key presses are ignored. */
    /** @param {Event} event */
    function observe(event)
    {
        if (!isTarget())
        {
            stop();
            return;
        }
        const input = /** @type {InputEvent & KeyboardEvent} */ (event);
        if (event.type === 'keydown' && !KEYS.includes(input.key))
        {
            return;
        }
        const doc = /** @type {Document} */ (event.currentTarget);
        samples.push(readSample(input, doc));
        if (samples.length > MAX_SAMPLES)
        {
            samples.shift();
        }
    }

    /** Read transient source metrics without retaining the source or touching clipboard data. */
    /** @param {InputEvent & KeyboardEvent} input @param {Document} doc @returns {ProbeSample} */
    function readSample(input, doc)
    {
        const target = /** @type {HTMLTextAreaElement | HTMLElement | null} */ (input.target);
        const text = target && 'value' in target ? target.value : target?.textContent ?? '';
        const selection = doc.getSelection()?.toString() ?? '';
        const composing = input.isComposing === true;
        const committed = ['input', 'compositionend'].includes(input.type) && !composing;
        return {
            event: input.type, key: KEYS.includes(input.key) ? input.key : '',
            inputType: (input.inputType ?? '').slice(0, 80),
            committedDelimiter: committed && (input.data ?? '').includes('`'), composing,
            targetTag: (target?.tagName ?? '').slice(0, 30),
            targetLength: text.length, targetHasSentinel: text.includes(SENTINEL),
            selectionLength: selection.length, selectionHasSentinel: selection.includes(SENTINEL),
            targetRangeCount: typeof input.getTargetRanges === 'function' ? input.getTargetRanges().length : 0,
        };
    }

    /** Inspect reachable frame documents only. Cross-origin access failures are counted, not bypassed. */
    /** @param {Document} doc */
    function attach(doc)
    {
        if (documents.includes(doc) || documents.length >= MAX_DOCUMENTS)
        {
            return;
        }
        documents.push(doc);
        for (const type of EVENTS)
        {
            doc.addEventListener(type, observe, true);
        }
        for (const frame of doc.querySelectorAll('iframe'))
        {
            attachFrame(frame);
        }
    }

    /** @param {HTMLIFrameElement} frame */
    function attachFrame(frame)
    {
        try
        {
            if (frame.contentDocument)
            {
                attach(frame.contentDocument);
            }
            else
            {
                blockedFrames++;
            }
        }
        catch
        {
            blockedFrames++;
        }
    }

    if (!isTarget())
    {
        throw new Error('PROBE_TARGET: Open the exact disposable Markdown test document before running this probe.');
    }
    if (globalThis.__outcropDocsProbe && globalThis.__outcropDocsProbe.signature !== SIGNATURE)
    {
        throw new Error('PROBE_CONFLICT: Another tool owns this diagnostic name. Reload the test document first.');
    }
    if (globalThis.__outcropDocsProbe)
    {
        globalThis.__outcropDocsProbe.stop();
    }
    globalThis.__outcropDocsProbe = { signature: SIGNATURE, report, stop };
    attach(rootDocument);
    timer = setTimeout(stop, EXPIRY_MS);
}
