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
- Technical content within blocks, including Mermaid diagrams, math described as MathML, and Graphviz diagrams.
- Syntax highlighting for code, although the user noted that other extensions may already provide it.

These requirements establish the product direction. They do not establish a complete Markdown dialect or a first-release feature list.
The exact block delimiter must support nested diagram and code fences without ambiguity.

## Proposed first workflow

The following behavior is a proposal, pending the interview and host verification.
The user selects a Markdown region and invokes Render/Update. The add-on previews the result before changing document content.
Ordinary prose outside that region retains its text and formatting.
The add-on retains the region's source so the user can edit and render the content again.
The source location and ownership model remain undecided.

Native Docs text formatting is the preferred output for supported inline text.
Diagrams and math may require supported image output in the document.
A browser preview alone does not establish successful insertion into Google Docs.
Live HTML, SVG, MathML objects, and native equation insertion are not promised.

## Reuse candidate

Outcrop's MarkdownRenderer documents standard Markdown, syntax highlighting, KaTeX math, Mermaid, and Graphviz rendering.
Inspect its implementation and dependency closure before selecting another renderer or creating duplicate functionality.
Its README documents TeX-style math input. This does not establish support for actual MathML input.
The user must clarify the requested math source syntax.

The component README is available in the theme repository under components/markdownrenderer/README.md.
The theme checkout is an inspection source, not a local build dependency.
Follow the selected live Outcrop component delivery and versioned third-party dependency contract in PROJECT.md.
The README's example dependency URLs and versions do not override that contract.

Graphviz is documented as client-side WebAssembly rendering through @viz-js/viz.
The component also offers server-rendered PlantUML. PlantUML is not requested and must remain disabled in this proposed integration.
Do not transmit document content to public rendering services.

## Host constraints and verification

Google documents edit triggers for Sheets, not Docs. The selected add-on cannot rely on an onEdit text trigger.
An explicit Render/Update action is the recommended initial interaction.
If automatic rendering as the user types is essential, assess feasibility before committing to that interaction or changing architecture.

Verify text-run formatting, image conversion and insertion, document tabs, selection offsets, and source recovery in the actual host.
Do not overwrite stale selections or unrelated collaborator changes.
Reject unsupported structures before mutation. Do not claim atomic changes or reliable undo without host evidence.
Choose the minimum authorization scopes only after defining the actual document operations and source storage.

## Draft acceptance cases

These cases guide the next design step. They are not approved release criteria or passing tests.

1. Render an inline code span within a sentence while preserving the surrounding words and formatting.
2. Render a fenced Markdown region while preserving adjacent document content.
3. Render a Mermaid example and a Graphviz example without a remote rendering service.
4. Render an agreed math example after the source syntax decision.
5. Recover the original source and update an existing region without duplicating output.
6. Preserve the source and existing document content when parsing or rendering fails.
7. Reject a changed or ambiguous target rather than overwrite unrelated content.
8. Provide keyboard access, understandable errors, and suitable descriptions for rendered technical content.

Define malformed syntax behavior, supported structures, rendering limits, and recovery rules before implementing these cases.
Treat Markdown, diagram labels, math, links, and generated SVG as untrusted input.
Do not execute source code or permit source-driven script execution or arbitrary network requests.

## Interview decisions still open

- Explicit Render/Update versus automatic rendering as the user types.
- Actual MathML input, TeX/LaTeX expressions, or both.
- Source editing and retention, block delimiters, and literal Markdown escape behavior.
- First-release Markdown features and whether syntax highlighting belongs in that release.
- Document structures, output fidelity, accessibility, and recovery guarantees.

## Implementation and tracking

Product scope and acceptance decisions belong to [issue #3](https://github.com/priyavijaikalyan2007/workspace/issues/3).
The product build/test adapter remains a prerequisite under [issue #4](https://github.com/priyavijaikalyan2007/workspace/issues/4).
Google-host checks remain under [issue #11](https://github.com/priyavijaikalyan2007/workspace/issues/11).
Browser work remains deferred. Local requirements and adapter work can continue.
No product feature implementation or integrated renderer verification occurred during this requirements pass.

## References

- [Google Editor add-on triggers](https://developers.google.com/workspace/add-ons/concepts/editor-triggers)
- [Google Docs text operations](https://developers.google.com/apps-script/reference/document/text)
- [Google Docs paragraph image operations](https://developers.google.com/apps-script/reference/document/paragraph)
- [Outcrop component documentation](https://static.outcrop.us/docs/)
- [Outcrop MarkdownRenderer source and README](https://github.com/priyavijaikalyan2007/b2btheme/tree/main/components/markdownrenderer)
- [First extension readiness](first-extension-readiness.md)
