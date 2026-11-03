<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: e6259d91-1b6a-48c8-8667-ae9a53280e98
Created: 2026
-->

<!-- AGENT: Current first-extension readiness and the next bounded implementation milestone. -->

# First extension readiness

The shared local foundation is sufficient to begin the extension's build adapter and product design.
Product-feature implementation still requires a working adapter and agreed acceptance criteria.
The planned Markdown component has no product implementation. Fixture packaging does not establish a working add-on.

The user deferred the cmux restart and browser setup on 3 November 2026.
Do not quit or restart cmux or resume browser work until the user is ready.
Independent local development can continue without Google credentials or browser control.

## Milestones

| Milestone | Current state | Remaining work | Tracking |
| --- | --- | --- | --- |
| Shared local foundation | Verified | Maintain the selected native tools and existing quality gates. | #4 |
| First local extension | Ready to start adapter work; no product features implemented | Embedded Markdown workflow identified; finalize acceptance criteria. Implement the product build/test adapter before features. | #3, #4 |
| Test inside Google Docs | Not ready; browser work deferred | Inspect the existing creation attempt, record script IDs, link dev Cloud configuration, and configure an acceptable remote client. Verify authorization and actual host behavior. | #11 |
| Production release | Not ready | Verify Ubuntu CI, production adapters, billing, permissions, publication state, About, accessibility, contacts, and licensing. | #4, #5, #6, #8, #9, #11 |

The development and production gates remain distinct.
A local test result cannot establish Google-host compatibility or production readiness.
The release safeguards remain mandatory before remote release operations.

## Next bounded implementation

1. Assess automatic-rendering feasibility using the bounded host cases in markdown-extension.md.
2. Record supported behavior, exclusions, permission needs, document-preservation rules, and observable acceptance criteria under issue #3.
3. Write failing tests for a real product build/test adapter under issue #4.
4. Connect the existing server/browser build boundary to a registered extension's source and package version.
5. Verify callback preservation, isolated types, embedded version metadata, and product test/coverage collection.
6. Verify that local commands neither require Google credentials nor trigger remote operations.
7. Implement the selected first feature after the adapter and its tests pass.
8. Verify the feature inside Google Docs when browser setup resumes.

Do not mark the component ready solely to bypass the existing planned-source guard.
Product code must enter type checks, lint, tests, and coverage before its feature checks can pass.
The existing tooling coverage cannot substitute for coverage of the extension.
Use Outcrop components for actual UI. Preserve the React prohibition and the selected CDN delivery model.

## Product decision

The user confirmed Markdown within a regular Google Doc, rather than file import or export.
The requested content includes inline spans, fenced Markdown blocks, Mermaid, math described as MathML, Graphviz, and possible code highlighting.
The confirmed intent, proposed interaction, reuse candidate, and open decisions are in [markdown-extension.md](markdown-extension.md).

Outcrop's MarkdownRenderer already documents most requested rendering capabilities. Its Docs integration remains unverified.
The user requires automatic rendering, editable source, and both MathML and TeX/LaTeX input.
The current add-on model must pass an automatic-rendering feasibility check. A persistent sidebar is not accepted.
Source preservation, block delimiters, first-release scope, and host acceptance criteria still need agreement.
Local adapter work does not require the deferred browser restart.

## Verification: 3 November 2026

The actual ./package.sh --fixture command passed on native macOS using Node.js 26.12.1 and npm 11.20.0.
It passed 176 TypeScript tests, seven shell checks, 213 retained Python tests, lint, profile checks, and separate runtime type checks.
Tooling line coverage was 95.86%. The command built and packaged the controlled fixture.
The generated development identity recorded the actual source commit and dirty state.
No product extension, Google upload, deployment, or publication was reported as successful.
Ubuntu CI execution remains unverified because the local commits are not pushed.

## References

- [Issue #3: first extension scope](https://github.com/priyavijaikalyan2007/workspace/issues/3)
- [Issue #4: local toolchain and product adapters](https://github.com/priyavijaikalyan2007/workspace/issues/4)
- [Issue #11: Google setup and host verification](https://github.com/priyavijaikalyan2007/workspace/issues/11)
- [Current command contract](../SETUP.md)
- [Markdown import/export and clipboard behavior](https://support.google.com/docs/answer/12014036?hl=en)
- [Native Markdown editing](https://support.google.com/docs/answer/18289341?hl=en)
- [Google's native Markdown announcement](https://workspaceupdates.googleblog.com/2026/10/preview-edit-and-collaborate-on-Markdown-files-natively-across-Drive-and-Docs.html)
