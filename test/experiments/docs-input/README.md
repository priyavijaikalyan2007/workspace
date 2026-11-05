<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 6f300236-31c2-43a4-aa44-c93b5d9a0673
Created: 2026
-->

<!-- AGENT: Reviewable, temporary host probe for Docs input and source-access feasibility. -->

# Disposable Docs input probe

This observer tests whether browser input events expose the source needed for automatic Markdown formatting.
It does not implement formatting or establish a supported Google Docs editing contract.
The source is plain JavaScript so the same reviewed bytes can run in DevTools without an install or remote loader.
The browser-extension product remains disabled. No persistent browser permission is required by this probe.

The probe activates only in the existing disposable test document:
[Disposable test document](https://docs.google.com/document/d/1_pTvhF7saa5RKLlC7cQbbzeM-XKvO_y_Fkfx8jC4MKI/edit?tab=t.0).
It rejects other URLs before attaching listeners and stops if the page changes to a different document.
It observes the current page and reachable same-origin frames. Inaccessible frames are counted, never bypassed.
It attaches to frames present at activation. Newly created frames require a new probe activation.

The report contains event types, selected control keys, input types, text lengths, and matches for the synthetic MD_PROBE_ALPHA marker.
The report never contains raw document text, ordinary character keys, clipboard contents, credentials, or frame URLs.
The observer performs no network calls, storage operations, editor writes, cancellation, or event propagation changes.
It expires after five minutes and retains at most 64 metric rows from at most 16 reachable documents.

## Local checks

Run the focused tests:

```sh
npm exec vitest -- run test/experiments/docs-input/probe.test.ts
```

Run the complete repository checks:

```sh
./test.sh
```

The root commands include browser checkJs, lint, tests, and a separate coverage threshold for probe.js.
The probe requires 90% lines, statements, and functions, plus 80% branches.
Fake-DOM tests verify the observer contract. They do not establish Docs events, text access, or safe formatting.

## Host procedure

Use only the synthetic document and the publisher testing profile for this experiment.
If the browser blocks console execution or displays a security warning, stop and record the blocker.
Do not change browser protections, authorization, or billing settings to complete this procedure.

1. Open the exact disposable document in the publisher testing profile.
2. Open Chrome DevTools Console for that document.
3. Select the top document context.
4. Review probe.js before execution.
5. Run the complete reviewed probe.js source in the console.
6. Run globalThis.__outcropDocsProbe.report() to confirm activation.
7. Focus the document body.
8. Enter MD_PROBE_ALPHA as ordinary text on a new line.
9. Enter a backtick-delimited code span after the marker.
10. Inspect globalThis.__outcropDocsProbe.report() in the console.
11. Compare keydown events with committed input events.
12. Check targetHasSentinel and selectionHasSentinel independently.
13. Stop the observer through globalThis.__outcropDocsProbe.stop().
14. Confirm that report().active is false.

Repeat a fresh activation for paste, deletion, composition, and selection cases when the basic event path is established.
Record whether the driver sends physical keys, pasted text, or another form of native text insertion.
Do not claim keystroke latency or physical-key coverage from a paste-only run.

A key event is not proof that document source is readable.
A marker visible in a selection is not proof of a stable Docs cursor/range mapping.
If source access is absent or ambiguous, stop before any formatting-write experiment.
The next gate requires a verified source range, native formatting, source recovery, cursor stability, undo, and stale-update rejection.

## Report interface

```js
globalThis.__outcropDocsProbe.report()
globalThis.__outcropDocsProbe.stop()
```

Stopping removes registered listeners and the expiry timer. The bounded metric report remains available in that page.
Reloading removes the page-local diagnostic object. Re-running the same probe stops its earlier listeners before replacement.
A foreign diagnostic object using the same name causes a refusal rather than an overwrite.

The test status and actual host observations belong in specs/markdown-input-experiment.md under issue #3.
