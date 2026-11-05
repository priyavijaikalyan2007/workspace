<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: a9a75232-7ec9-4541-a705-f4499a43e967
Created: 2026
-->

<!-- AGENT: Reproducible input-event observations and the source-access gate for issue #3. -->

# Docs input experiment

## Result: 5 November 2026

A temporary page observer detected backtick key presses in the disposable Google Doc.
Those key events did not expose the surrounding source through their target or DOM selection.
A paste input event exposed the synthetic marker in its target. This did not establish a stable document range.
The source-access gate remains incomplete. No automatic formatting write was attempted.
[Issue #3](https://github.com/priyavijaikalyan2007/workspace/issues/3) remains In Progress in the workspace Project.

This result supports further investigation of delimiter detection. It does not establish a working automatic formatter.
The test ran in DevTools page context, not an extension's isolated world or an Apps Script callback.
The browser-extension product remains disabled, and the Markdown product remains planned.

## Scope and method

The user asked to continue experiments and confirmed that the testing window was active.
Native Chrome control reached the Priyavijai Kalyan (Knobby.IO Testing) profile.
The existing [disposable document](https://docs.google.com/document/d/1_pTvhF7saa5RKLlC7cQbbzeM-XKvO_y_Fkfx8jC4MKI/edit?tab=t.0) was the only editor target.
Browser-tab control remained unavailable. Native DevTools control was sufficient for this bounded test.

The [probe source](../test/experiments/docs-input/probe.js) contains no network, storage, clipboard-read, or document-write operations.
The observer retained only event metadata, text lengths, and matches for MD_PROBE_ALPHA.
Its limits are 64 samples, 16 reachable documents, and five minutes of activity.
It rejects another document and refuses to replace an unrelated diagnostic object.
The [procedure](../test/experiments/docs-input/README.md) describes activation, cleanup, and the report interface.
No pattern required - simple functions suffice for this bounded observer.

The executed source was locally minified through the existing esbuild dependency.
The reviewed unminified source SHA-256 was:

```text
4da859fd12f2757e4fff98002101d9041a65276208a3249f8ef2be08a3b326ce
```

The first attempted text entry remained in the Console prompt and was cleared without execution.
That attempt is excluded from the results. DevTools was then closed, and document focus was verified before input.
The first document case combined native text insertion with separate backtick key actions.
The second case used explicit native paste, then a line-selection shortcut.
The third case used individual native character and backtick key actions.
These are tool-driven native inputs. They do not establish hardware-key, input-method, or latency coverage.

## Observed metrics

Activation reached six documents and counted two unavailable frames.
The observer recorded ten samples before cleanup. All event targets were DIV elements.
The rows below group matching samples and preserve their order:

| Count | Event | Key or input type | Target length | Target marker | Selection length | Target ranges |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | keydown | Enter | 2 | false | 0 | 0 |
| 2 | keydown | backtick | 2 | false | 0 | 0 |
| 1 | keydown | Enter | 2 | false | 0 | 0 |
| 1 | paste | empty | 2 | false | 0 | 0 |
| 1 | beforeinput | insertFromPaste | 0 | false | 0 | 1 |
| 1 | input | insertFromPaste | 29 | true | 0 | 0 |
| 1 | keydown | Enter | 1 | false | 1 | 0 |
| 2 | keydown | backtick | 2 | false | 0 | 0 |

Every selection marker match was false. Every committedDelimiter field was false.
Only paste produced beforeinput and input samples in this run.
The paste event's available target range was counted but its mapping to Docs offsets was not tested.
The marker match establishes transient pasted-text access, not surrounding paragraph access or source persistence.
Ordinary character keydown events are deliberately excluded from the report.

The final document visibly retained the original two baseline paragraphs, the MD_PROBE_ALPHA inline-span test, and the individual-key test.
The pasted paragraph was not retained in the final visible document after the selection and subsequent input sequence.
Do not treat that sequence as a paste-preservation or cursor-stability pass.
Docs reported Saved to Drive. The probe reported active=false, six documents, two unavailable frames, and ten retained samples.
DevTools was closed after cleanup. No security warning was bypassed, and no extension or permission was installed.

## Local verification

The existing baseline passed 218 TypeScript tests before implementation.
The initial 14 probe tests failed because probe.js did not exist.
A later test exposed replacement of an unrelated diagnostic. The implementation then added a conflict refusal.
All 19 observer tests now pass. They cover the observer contract through fake browser objects, not Google Docs compatibility.
Browser checkJs, root type checks, and lint passed.

The full ./test.sh command passed 237 TypeScript and JavaScript tests, seven shell checks, and 213 Python tests.
Probe coverage was 100% lines, statements, and functions, plus 93.18% branches.
Aggregate line coverage was 96.73%. The probe has its own enforced coverage threshold.
Markdown remains explicitly planned in the validation output. These checks do not count as product-feature tests.
Local red, green, coverage, and full-run logs were retained under /tmp/workspace-docs-probe-*.log for this session.

## Remaining gate and next action

The next experiment must establish nearby source and its exact Docs location before attempting writes.
Test whether a supported document API can pair a synthetic selection with the correct paragraph and offsets.
Measure that route separately from page events. An API selection alone does not establish automatic activation or event-to-range correspondence.
Any open-interface polling requirement or installed browser extension needs a separate product decision before adoption.

Formatting, source recovery, undo/redo, cursor stability, collaborator changes, composition, document tabs, and reload remain unverified.
No backend, billing change, Google code upload, deployment, publication, or product-platform change occurred.
Ownership remains unassigned beyond this engineering investigation. Keep follow-up evidence under issue #3 rather than a separate local backlog.

## Reference contracts

- [Chrome Console JavaScript](https://developer.chrome.com/docs/devtools/console/javascript)
- [beforeinput event](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event)
- [InputEvent.isComposing](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/isComposing)
