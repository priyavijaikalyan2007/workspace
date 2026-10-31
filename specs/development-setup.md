<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 5864baef-50d5-49e5-8c5c-b044152ea6d5
Created: 2026
-->

<!-- AGENT: Shared development setup requirements, proposals, and verification criteria. -->

# Shared development setup

[Issue #4](https://github.com/priyavijaikalyan2007/workspace/issues/4) tracks this work.
Complete the shared setup before implementing extension features. The tool selections below remain proposals.

## Confirmed requirements

- Support a consistent development workflow across one or more extensions.
- Document the selected frameworks, tools, commands, inputs, outputs, and release destinations.
- Keep agent instructions consistent with the verified scripts.
- Retain strict test-first implementation and the existing coverage requirements.
- Keep each extension's source, manifest, tests, generated output, and deployment configuration identifiable.
- Verify the setup using controlled fixtures before product source exists. Do not report fixture checks as product validation.

## Proposed toolchain

| Area | Proposal | Purpose |
| --- | --- | --- |
| Repository packages | npm workspaces, one root lockfile | Share tool versions while keeping extensions independently configurable. |
| Source language | TypeScript with strict checks | Check contracts across processing code, Google adapters, and browser code. |
| Build tools | TypeScript compiler for type checks and esbuild for bundling | Produce distinct Apps Script and browser artifacts. |
| Local tests | Vitest and its V8 coverage provider | Test processing, host boundaries, and build artifacts. |
| Code checks | ESLint, typescript-eslint, and ESLint Stylistic | Enforce correctness and the configured Allman brace style. |
| Google operations | Repository-pinned clasp | Inspect upload contents and manage configured Apps Script projects and versions. |
| Automated checks | GitHub Actions invokes the same root commands as local development | Prevent local and CI validation from using different checks. |

Pin compatible tool versions after the toolchain decision. Keep Node.js build dependencies out of Apps Script upload artifacts.
Separate server and browser TypeScript configurations so browser and Node.js APIs cannot silently enter server code.
Verify global Google callbacks in generated artifacts. Bundling module exports alone does not establish host-callable functions.

Do not choose a universal browser UI framework before discussing the supported add-on models and UI needs.
Editor sidebars and card-based Workspace add-ons have different UI contracts.

## Proposed root command contract

The names below define proposed responsibilities. They are not implemented commands or verified syntax.
Root scripts should delegate to a shared runner and the selected extension's configuration.
Local operations should support one extension or all enabled extensions.
Remote operations must require an explicit extension and environment.

| Entry point | Responsibility |
| --- | --- |
| configure.sh | Configure and validate instruction selection. Keep this separate from product builds. |
| build.sh | Type-check and assemble runtime-compatible artifacts without uploading them. |
| test.sh | Run the complete local validation suite, including code checks, tests, and coverage. |
| package.sh | Assemble and inspect a release artifact from verified build output. |
| upload.sh | Upload prepared files to an explicitly configured Apps Script project. |
| deploy.sh | Create or update the configured deployment from a verified uploaded version. |
| publish.sh | Check publication readiness and support the applicable Marketplace submission process. Report manual steps explicitly. |
| smoke.sh | Verify the selected integration in its actual Google host and report any unverified steps. |
| clean.sh | Remove only generated output owned by the selected component or shared tooling. |

Separate upload, deployment, and Marketplace publication results. An upload or deployment does not establish Marketplace publication.
Document callbacks, manifests, permissions, artifacts, environments, and credentials before remote operations can run.
Do not replace an unimplemented operation with a successful no-op or an empty passing test suite.

## Interview decisions still needed

- Confirm the shared package and toolchain proposal or select alternatives.
- Decide which add-on runtimes and UI approaches the initial setup must support.
- Confirm supported developer operating systems and the CI environment.
- Define extension selection, environment names, and script options.
- Define release credentials, artifact promotion, publication steps, and verification limits.

## Completion criteria

- Record accepted tools, versions, and architecture in PROJECT.md and the component profile.
- Write failing tests for script contracts and artifact boundaries before implementing the tooling.
- Verify selection, invalid arguments, missing configuration, failed prerequisites, and failure propagation.
- Verify that generated Apps Script excludes unsupported modules, browser globals, development dependencies, and credentials.
- Verify that local commands require no Google credentials and cannot trigger remote operations.
- Verify the same local commands in CI on the supported platforms.
- Update README.md, SETUP.md, ADDITIONAL.md, and applicable entry files with verified commands and limits.
- Keep Google account setup, host verification, and publication requirements explicit when they need external configuration.

## Source references

- [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/).
- [TypeScript strict checks](https://www.typescriptlang.org/tsconfig/strict).
- [TypeScript without emitted JavaScript](https://www.typescriptlang.org/tsconfig/noEmit).
- [esbuild formats and global exports](https://esbuild.github.io/api/).
- [Vitest coverage](https://vitest.dev/guide/coverage).
- [ESLint brace style and its maintained replacement](https://eslint.org/docs/latest/rules/brace-style).
- [clasp source and current command reference](https://github.com/google/clasp).
- [Google add-on publication overview](https://developers.google.com/workspace/add-ons/how-tos/publish-add-on-overview).
