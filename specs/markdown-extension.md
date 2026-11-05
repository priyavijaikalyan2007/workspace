<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 1bcb203d-d83b-4abf-91d3-b0464c5f3958
Created: 2026
-->

<!-- AGENT: Confirmed product intent, proposed behavior, and unresolved acceptance decisions. -->

# Markdown within a Google Doc

## Confirmed problem

The user wants to mix regular Google Docs content with Markdown for technical content.
The first extension remains a Google Docs Editor add-on. It does not solve Markdown file import or export.
Google's native .md editing does not replace this requested workflow inside a regular document.

The user identified these forms:

- Inline Markdown within ordinary prose, such as a code span enclosed in backticks.
- Explicit fenced Markdown blocks within a regular document.
- Technical content within blocks, including Mermaid diagrams, both MathML and TeX/LaTeX math, and Graphviz diagrams.
- Syntax highlighting for code, although the user noted that other extensions may already provide it.

These requirements establish the product direction. They do not establish a complete Markdown dialect or a first-release feature list.
The exact block delimiter must support nested diagram and code fences without ambiguity.

## Proposed first workflow

The following behavior is a proposal, pending the interview and host verification.
The user requires automatic rendering and rejected a required Render/Update action.
Editable source is confirmed. The user also confirmed both MathML markup and TeX/LaTeX expressions.
A sidebar is not an accepted product requirement. The user questioned why one would be necessary.
The automatic interaction and source-editing design remain subject to feasibility checks.
Ordinary prose outside that region retains its text and formatting.
The add-on must retain the region's source so the user can edit the content and obtain updated output.
The source location and ownership model remain undecided.

Native Docs text formatting is the preferred output for supported inline text.
Diagrams and math may require supported image output in the document.
A browser preview alone does not establish successful insertion into Google Docs.
Live HTML, SVG, MathML objects, and native equation insertion are not promised.

## Reuse candidate

Outcrop's MarkdownRenderer documents standard Markdown, syntax highlighting, KaTeX math, Mermaid, and Graphviz rendering.
Inspect its implementation and dependency closure before selecting another renderer or creating duplicate functionality.
Its README documents TeX-style math input. This does not establish support for actual MathML input.
Actual MathML input needs separate rendering support or an extension to the component.
Do not treat MathML output from KaTeX as support for MathML input.

The component README is available in the theme repository under components/markdownrenderer/README.md.
The theme checkout is an inspection source, not a local build dependency.
Follow the selected live Outcrop component delivery and versioned third-party dependency contract in PROJECT.md.
The README's example dependency URLs and versions do not override that contract.

Graphviz is documented as client-side WebAssembly rendering through @viz-js/viz.
The component also offers server-rendered PlantUML. PlantUML is not requested and must remain disabled in this proposed integration.
Do not transmit document content to public rendering services.

## Proposed integration boundary

MarkdownRenderer is a browser UI component. It cannot become a live component inside the Google Docs document body.
A document adapter must identify regions, preserve source, and update supported Docs text or image elements.
For inline code, that adapter would apply native text formatting. Complex diagrams and math may require image conversion.
HTML rendering is not a general HTML-to-Docs conversion API.

The earlier sidebar proposal supplied a browser runtime for rendering and periodic checks through google.script.run.
An HTML-service sidebar is a separate interface, not a document-embedded widget.
The user did not accept a persistent sidebar. Do not require one merely to reuse MarkdownRenderer.
Periodic checks while an interface remains open are a feasibility candidate, not verified automatic integration.
Check latency, quotas, completion detection, cursor movement, concurrent edits, and interface lifecycle before accepting that candidate.
No document content should be sent to third-party rendering services.
If the current add-on model cannot meet the intended document experience, present the measured limits before proposing a model change.

## Host constraints and verification

Google documents edit triggers for Sheets, not Docs. The selected add-on cannot rely on an onEdit text trigger.
A required Render/Update action does not meet the confirmed requirement.
The existing Editor add-on selection must pass an automatic-rendering feasibility check before feature implementation.
Do not claim that a browser extension would solve this limitation without proving its own supported integration.

Verify text-run formatting, image conversion and insertion, document tabs, selection offsets, and source recovery in the actual host.
Do not overwrite stale selections or unrelated collaborator changes.
Reject unsupported structures before mutation. Do not claim atomic changes or reliable undo without host evidence.
Choose the minimum authorization scopes only after defining the actual document operations and source storage.

## Draft acceptance cases

These cases guide the next design step. They are not approved release criteria or passing tests.

1. Render an inline code span within a sentence while preserving the surrounding words and formatting.
2. Render a fenced Markdown region while preserving adjacent document content.
3. Render a Mermaid example and a Graphviz example without a remote rendering service.
4. Render both an actual MathML example and a TeX/LaTeX example.
5. Recover the original source and update an existing region without duplicating output.
6. Preserve the source and existing document content when parsing or rendering fails.
7. Reject a changed or ambiguous target rather than overwrite unrelated content.
8. Provide keyboard access, understandable errors, and suitable descriptions for rendered technical content.
9. Detect and render completed Markdown automatically without a required Render/Update action.

Define malformed syntax behavior, supported structures, rendering limits, and recovery rules before implementing these cases.
Treat Markdown, diagram labels, math, links, and generated SVG as untrusted input.
Do not execute source code or permit source-driven script execution or arbitrary network requests.

## Interview decisions still open

- Automatic activation, acceptable rendering delay, and source-editing interaction.
- Source retention mechanism, block delimiters, and literal Markdown escape behavior.
- First-release Markdown features and whether syntax highlighting belongs in that release.
- Document structures, output fidelity, accessibility, and recovery guarantees.

## Next bounded feasibility check

The first proof must establish the document interaction before integrating complex renderers.
Use a disposable test document for the host proof. Native browser inspection recovered on 5 November 2026.
Do not create another Apps Script project before inspecting the earlier creation attempt under issue #11.

The documented Editor add-on triggers provide no Docs text-edit event.
An open-interface polling proposal remains unaccepted and unverified. It does not establish interface-free automatic operation.
Chrome content scripts can run in web pages, but that capability is not a supported Google Docs editing contract.
Google announced canvas-based document rendering and warned of extension compatibility changes.
A browser-extension candidate must prove reliable content access and document writes, not merely observe keyboard events.
No browser-extension component is enabled by this assessment.

The host proof must cover these cases:

1. Type a backtick-delimited code span within an ordinary sentence.
2. Observe automatic formatting after complete syntax without invoking Render/Update.
3. Verify that surrounding text, formatting, and cursor position remain correct.
4. Recover and edit the source, then verify automatic replacement without duplicate output.
5. Use undo and redo, then verify both visible content and retained source.
6. Change the target through a collaborator, then verify that stale output cannot overwrite the change.
7. Close any auxiliary UI and record whether automatic behavior continues.
8. Reload the document and record activation requirements and source recovery.

Measure delay, request frequency, supported browser behavior, and authorization needs.
Record incomplete syntax, pasted content, document-tab changes, and input-method composition as follow-up host cases in issue #3.
Successful local mocks cannot establish any of these host results.

If no supported approach meets the required interaction, report that finding before implementing diagrams or changing the selected platform.
The local build/test adapter is implemented under issue #4. Actual source must follow [its contract](product-adapter.md).
Native browser inspection now works. Actual host feasibility remains unverified.

## Implementation and tracking

Product scope and acceptance decisions belong to [issue #3](https://github.com/priyavijaikalyan2007/workspace/issues/3).
The local product adapter is implemented under [issue #4](https://github.com/priyavijaikalyan2007/workspace/issues/4). Markdown source remains planned.
Google-host checks remain under [issue #11](https://github.com/priyavijaikalyan2007/workspace/issues/11).
Native browser inspection recovered after the computer restart on 5 November 2026. The automatic host proof remains unverified.
No product feature implementation or integrated renderer verification occurred during this requirements pass.

## References

- [Apps Script browser/server communication](https://developers.google.com/apps-script/guides/html/communication)
- [Apps Script HTML sandbox](https://developers.google.com/apps-script/guides/html/restrictions)
- [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Google Docs canvas rendering announcement](https://workspaceupdates.googleblog.com/2021/05/Google-Docs-Canvas-Based-Rendering-Update.html)
- [Google Editor add-on triggers](https://developers.google.com/workspace/add-ons/concepts/editor-triggers)
- [Google Docs text operations](https://developers.google.com/apps-script/reference/document/text)
- [Google Docs paragraph image operations](https://developers.google.com/apps-script/reference/document/paragraph)
- [Outcrop component documentation](https://static.outcrop.us/docs/)
- [Outcrop MarkdownRenderer source and README](https://github.com/priyavijaikalyan2007/b2btheme/tree/main/components/markdownrenderer)
- [First extension readiness](first-extension-readiness.md)
