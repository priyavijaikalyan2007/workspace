<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 1224ec48-622a-4f9a-8c3a-1552d793b65d
Created: 2026
-->

<!-- AGENT: Test-first implementation plan and evidence for the first local tooling milestone. -->

# Local tooling implementation

Issue #4 owns the milestone. Issue #9 owns the complete release identity and About workflow.
The prerequisite retained-test repair is tracked in issue #10.

## Baseline

The retained tool suite initially reported 3 failures and 10 errors across 213 tests.
Self-contained source snapshots and bounded profiles now preserve the existing assertions and pass all 213 tests.
Profile validation also passes. Product source and product operation scripts remain unimplemented at this point.

## First milestone

Install pinned, compatible tools and implement the shared local command runner.
Build and package a clearly labeled validation fixture without creating a product feature or contacting Google.
Keep the planned Markdown component distinct from buildable components.
Run the same native commands locally on macOS and in the Ubuntu CI workflow.

No pattern required: focused functions and explicit data contracts suffice.
Thin shell entry points delegate to the TypeScript runner. Processing, file safety, and artifact generation remain testable functions.

## Files and interfaces

- Root configuration: package.json, package-lock.json, .node-version, .npmrc, tsconfig.json, eslint.config.mjs, and vitest.config.ts.
- Operational registry: workspace.config.json, with explicit planned/buildable extension state and source ownership.
- Tool package: src/tool/workspace-build/package.json.
- Argument contract: args.ts exports CliOptions and parseArguments(args).
- Configuration contract: config.ts exports ExtensionConfig and loadExtension(root, selection).
- Build identity: version.ts exports BuildInfo and createBuildInfo(inputs).
- Source identity: source.ts exports SourceState and readSourceState(root).
- Error contract: errors.ts exports ToolError with a stable code, advice, and exit status.
- File boundary: files.ts validates owned output paths and rejects symlink or traversal escapes.
- Artifact generation: build.ts creates Apps Script and browser output, preserves callbacks, and embeds build identity.
- Packaging: package.ts validates prerequisites, inspects files, and records hashes before producing an immutable package.
- Execution: process.ts, validation.ts, runner.ts, and cli.ts handle processes, validation, dispatch, and diagnostics.
- Root operations: build.sh, test.sh, package.sh, clean.sh, upload.sh, deploy.sh, publish.sh, and smoke.sh.
- Controlled input: test/fixtures/googleworkspace contains source, manifest, and HTML/CSS packaging inputs.
- Tests: src/tool/workspace-build/test and test/shell verify contracts, artifacts, failure propagation, and shell entry points.
- CI: .github/workflows/validate.yml runs native Ubuntu checks using the pinned tools and shared root operations.
- Records: update PROJECT_PROFILE.md, AGENTS.md, PROJECT.md, README.md, SETUP.md, CHANGELOG.md, CONVERSATION.md, and agentknowledge.

Interface details and new file names can change during implementation when tests expose a clearer boundary.
Update this plan when that happens. Keep each named data type in its owning module and avoid duplicate representations.

## Test-first sequence

1. Write argument, configuration, version, file-safety, artifact, and package contract tests before implementation.
2. Install the selected test harness and demonstrate that the new tests fail.
3. Implement only the behavior needed to pass the failing cases.
4. Cover unsafe paths, symlinks, unknown selections, missing configuration, malformed build numbers, and rejected artifacts.
5. Verify global callbacks, valid manifests, matching server/browser build identity, and exclusion of development files.
6. Verify package prerequisite failures and immutable-output collision handling.
7. Add shell integration checks and native Ubuntu CI configuration.
8. Run complete local validation and the fixture package operation before committing.

## Limits

No Google projects, credentials, or billing changes are needed for this milestone.
Remote operations must reject missing configuration and must never report an upload or publication that did not occur.
Actual Google-host behavior, About UI, project billing checks, and production promotion remain explicit follow-up verification work.
Ubuntu CI execution cannot be reported as passing until the workflow actually runs after an authorized push.
