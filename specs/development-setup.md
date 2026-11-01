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
Complete the shared setup before implementing extension features. The user accepted the local toolchain on 31 October 2026.
The user accepted the UI approach, script selection interface, and macOS CI on 1 November 2026.
The user accepted separate dev/prod projects, automatic package validation, and clean-source production gates on 1 November 2026.
Tool versions, project identifiers, and release credentials still need configuration.

## Confirmed requirements

- Support a consistent development workflow across one or more extensions.
- Document the selected frameworks, tools, commands, inputs, outputs, and release destinations.
- Keep agent instructions consistent with the verified scripts.
- Retain strict test-first implementation and the existing coverage requirements.
- Keep each extension's source, manifest, tests, generated output, and deployment configuration identifiable.
- Verify the setup using controlled fixtures before product source exists. Do not report fixture checks as product validation.
- Support development on the user's Mac. Additional developer operating systems are outside the initial support scope.
- Do not introduce a separately hosted application backend for the initial extensions.

## Selected local toolchain

| Area | Selection | Purpose |
| --- | --- | --- |
| Repository packages | npm workspaces, one root lockfile | Share tool versions while keeping extensions independently configurable. |
| Source language | TypeScript with strict checks | Check contracts across processing code, Google adapters, and browser code. |
| Build tools | TypeScript compiler for type checks and esbuild for bundling | Produce distinct Apps Script and browser artifacts. |
| Local tests | Vitest and its V8 coverage provider | Test processing, host boundaries, and build artifacts. |
| Code checks | ESLint, typescript-eslint, and ESLint Stylistic | Enforce correctness and the configured Allman brace style. |
| Google operations | Repository-pinned clasp | Inspect upload contents and manage configured Apps Script projects and versions. |
| CI checks | GitHub Actions on macOS | Invoke the same root validation and build commands for pull requests. |

These selections are accepted but not yet installed or validated as a repository toolchain.
Pin compatible tool versions during implementation. Keep Node.js build dependencies out of Apps Script upload artifacts.
Separate server and browser TypeScript configurations so browser and Node.js APIs cannot silently enter server code.
Verify global Google callbacks in generated artifacts. Bundling module exports alone does not establish host-callable functions.

## Selected UI and component delivery

Use plain TypeScript, HTML, and CSS. React is prohibited.
Prefer the Outcrop components documented at https://static.outcrop.us/docs/.
PROJECT.md records the canonical asset origin, local source path, dependency manifest, and upstream issue tracker.
Use the published component contracts and theme tokens instead of creating duplicate components or a separate appearance system.
Request missing components or shared fixes through the UI team's issue tracker and link the request to the workspace issue.

Follow the documented CDN model: theme files and components remain live, while third-party libraries use versioned URLs and integrity hashes.
Do not describe the complete UI as frozen by the npm lockfile. Live theme and component updates can change its runtime assets.
Do not hash-pin a mutable theme URL. Pin the third-party library URLs and hashes supplied by the dependency manifest.
Do not make the user's local theme checkout a build or CI prerequisite.

Verify selected factories, peer dependencies, asset loading order, fonts, icons, workers, and dynamic resource paths.
Test integration in Google's HTML-service sandbox, including its navigation, framing, and HTTPS restrictions.
Use the required Playwright browser workflow for user-facing changes and relevant component integration checks.
Target WCAG 2.2 AA and retain keyboard and manual accessibility checks alongside automated checks.
The theme's accessibility goals do not establish that the integrated add-on meets all applicable success criteria.

## Selected runtime boundary

The existing profile selects a Google Docs Editor add-on implemented through Apps Script.
Editor add-ons require Apps Script. Their HTML-service browser pages can call server-side Apps Script functions.
Google hosts those functions, so this model does not require a separately hosted application backend.
It is not strictly browser-only execution.

The user confirmed that Google-hosted Apps Script is acceptable and that no separately hosted application backend is needed.
Use browser UI code and Google-hosted Apps Script with distinct build boundaries.
The selected local toolchain supports this model, subject to runtime-compatible artifacts and actual host verification.

## Selected root command contract

The command responsibilities and selection interface are accepted. The commands are not yet implemented or verified.
Root scripts should delegate to a shared runner and the selected extension's configuration.
Use `--extension <name>` for product operations. Local build and test commands default to all enabled extensions.
Remote operations must require `--extension <name>` and `--environment <name>`.
Host smoke checks also require an explicit extension and environment.
Reject invalid or missing selections before remote work. Keep configure.sh's instruction-configuration options separate.

The CI workflow must call the same root test.sh and build.sh commands on macOS for pull requests.
Keep upload, deployment, and publication outside automatic pull-request checks.

| Entry point | Responsibility |
| --- | --- |
| configure.sh | Configure and validate instruction selection. Keep this separate from product builds. |
| build.sh | Type-check and assemble runtime-compatible artifacts without uploading them. |
| test.sh | Run the complete local validation suite, including code checks, tests, and coverage. |
| package.sh | Run full validation and build, then assemble and inspect the release artifact. |
| upload.sh | Upload prepared files to an explicitly configured Apps Script project. |
| deploy.sh | Create or update the configured deployment from a verified uploaded version. |
| publish.sh | Check publication readiness and support the applicable Marketplace submission process. Report manual steps explicitly. |
| smoke.sh | Verify the selected integration in its actual Google host and report any unverified steps. |
| clean.sh | Remove only generated output owned by the selected component or shared tooling. |

Separate upload, deployment, and Marketplace publication results. An upload or deployment does not establish Marketplace publication.
Document callbacks, manifests, permissions, artifacts, environments, and credentials before remote operations can run.
Do not replace an unimplemented operation with a successful no-op or an empty passing test suite.

## Selected release controls

Use separate dev and prod Apps Script projects for each extension.
Make package.sh run the complete local validation suite and build. Stop after any failed prerequisite.
Require a clean, committed source checkout and an explicit version for production.
Development uploads may use uncommitted changes when build metadata records the dirty state.

Support BUILD_NUMBER as an injected build property for local, CI, and release builds.
Persist the effective version in the repository and artifact metadata. Keep verified production state distinct from candidate or failed releases.
Provide an About action that displays the version and source identity embedded in the running artifact.
The complete requirements and remaining version-policy decisions are in specs/release-versioning.md.

## Interview decisions still needed

- Configure the dev/prod project mappings and remaining script options.
- Define release credentials, artifact promotion, publication steps, and verification limits.
- Implement stable SemVer build metadata, the independent production release sequence, and persisted release records under issue #9.

## Completion criteria

- Record accepted tools, versions, and architecture in PROJECT.md and the component profile.
- Write failing tests for script contracts and artifact boundaries before implementing the tooling.
- Verify selection, invalid arguments, missing configuration, failed prerequisites, and failure propagation.
- Verify that generated Apps Script excludes unsupported modules, browser globals, development dependencies, and credentials.
- Verify that local commands require no Google credentials and cannot trigger remote operations.
- Verify that macOS CI invokes the same local commands and document its pinned runner and tool versions.
- Check selected theme components and their complete dependency closure in the Google-hosted UI.
- Verify the React prohibition in dependency checks and shipped artifacts.
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
- [Google add-on types and Editor add-on runtime](https://developers.google.com/workspace/add-ons/concepts/types).
- [HTML-service browser and server communication](https://developers.google.com/apps-script/guides/html/communication).
- [Selected Outcrop component documentation](https://static.outcrop.us/docs/).
- [Outcrop CDN integration guide](https://static.outcrop.us/docs/CDN_INTEGRATION_GUIDE.html).
- [Google HTML-service sandbox restrictions](https://developers.google.com/apps-script/guides/html/restrictions).
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
