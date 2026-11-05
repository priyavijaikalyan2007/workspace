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

The shared local foundation and product adapter support local work on implemented extensions.
Product-feature implementation still requires supported automatic document interaction and agreed acceptance criteria.
The planned Markdown component has no product implementation. Fixture packaging does not establish a working add-on.

The user deferred the cmux restart and browser setup on 3 November 2026.
Native Chrome access recovered on 5 November 2026. The existing script remains linked to the default Cloud project.
Independent local development can continue without Google credentials or browser control.

## Milestones

| Milestone | Current state | Remaining work | Tracking |
| --- | --- | --- | --- |
| Shared local foundation | Verified | Maintain the selected native tools and existing quality gates. | #4 |
| First local extension | Local adapter verified against synthetic source; no Markdown features implemented | Prove automatic document interaction, finalize acceptance criteria, and implement product source. | #3, #4 |
| Test inside Google Docs | Not ready; native inspection recovered | Verify dev/prod script pairing, link Cloud configuration, and configure an acceptable remote client. Verify authorization and actual host behavior. | #11 |
| Production release | Not ready | Verify Ubuntu CI, production adapters, billing, permissions, publication state, About, accessibility, contacts, and licensing. | #4, #5, #6, #8, #9, #11 |

The development and production gates remain distinct.
A local test result cannot establish Google-host compatibility or production readiness.
The release safeguards remain mandatory before remote release operations.

## Next bounded implementation

1. Assess automatic-rendering feasibility using the bounded host cases in markdown-extension.md.
2. Record supported behavior, exclusions, permission needs, document-preservation rules, and observable acceptance criteria under issue #3.
3. Use the verified local adapter contract in product-adapter.md when product source enters scope.
4. Implement the selected first feature through failing tests after the host proof establishes a supported interaction.
5. Add product source to its separate type, lint, test, and coverage checks.
6. Verify the feature inside Google Docs after local checks pass.

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
Local adapter work is complete for the bounded contract. Native browser inspection now works. Automatic document interaction still needs host evidence.

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


## Adapter verification: 5 November 2026

The full fixture package passed 218 TypeScript tests, seven shell checks, and 213 retained Python tests.
Tooling line coverage was 96.42%. Real synthetic-product checks verify isolated types and independent product coverage.
[The adapter contract](product-adapter.md) records supported inputs, outputs, and limits.
No product source, ready Markdown registry state, Google-host result, upload, deployment, or publication was introduced.
