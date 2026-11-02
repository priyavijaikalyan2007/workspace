<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 3fb839c4-6fb7-441f-953d-4d071f21ede5
Created: 2026
-->

<!-- AGENT: Release persistence implementation plan and verification evidence for issue #9. -->

# Release persistence implementation

The user authorized the next setup milestone on 2 November 2026.
Issue #9 owns release records and About diagnostics. Issue #11 owns Google configuration and host verification.
The existing 81 tooling tests pass with 96.28% line coverage before this work.

No pattern required: focused functions and injected build/verification callbacks suffice.
The CLI remains thin. Local storage, state transitions, source checks, and diagnostics are independently testable.
No production add-on exists yet. Do not create fictional release records or mark the fixture as production.

## Files and interfaces

- release-data.ts and release-artifact.ts: canonical metadata, bounded decoding, and actual package-byte verification.
- release-event.ts: ReleaseEvent discriminated union and validated persisted event decoding.
- release-state.ts: validate history, select current production, and enforce version/sequence transitions.
- release-store.ts: readLedger(root, extension), withLedger(root, extension, action), atomic JSON writes and per-extension locks.
- release.ts: createCandidate(root, extension, version, build), failCandidate(root, extension, candidateId, reasonCode), and confirmProduction(root, extension, candidateId, verify, rollback).
- observation.ts: ProductionObservation and verification of actual artifact identity and Google publication evidence.
- diagnostics.ts: formatDiagnostics(extension, info), using an allowlist of safe embedded identity fields.
- args.ts, runner.ts, release.sh: read-only inspection through ./release.sh --extension NAME.
- release tests: temporary Git repositories, real filesystem writes, corrupt histories, failed validation/build/write paths, lock contention, promotion, rollback, and safe diagnostics.
- releases/README.md: record ownership, separate source/record commits, locking, recovery, and operation limits.
- REUSE.toml, .gitignore, PROJECT_PROFILE.md: tracked record attribution, transient lock exclusions, and source ownership.
- SETUP.md, PROJECT.md, release specifications, CHANGELOG.md, CONVERSATION.md, agentknowledge/: verified status and handoff.

## Data and operations

Each extension owns releases/NAME.json. A schema-versioned history contains immutable events.
Each candidate records a full embedded version, actual clean source commit, build number, sequence, and SHA-256 file hashes.
The checked-in extension package version must match the explicit requested version.
The build callback receives the allocated metadata before generating server/browser output.
Record the candidate only after a successful build returns verified artifact hashes.
Use a separate source commit and later release-record commit. Do not auto-commit release records from ordinary builds.

Serialize updates using an exclusive per-extension lock. Write and sync a temporary file before atomic replacement.
Do not silently recover or remove a pre-existing lock. Preserve the previous history after any failed operation.
A failed reservation may leave a package for inspection but must not create a successful candidate record.

An active candidate must resolve before another candidate is allocated.
Candidate sequences never repeat, including failed candidates. Production sequences can therefore contain gaps.
A new production core must advance past every previous production core, including after rollback.
When major increases, reset minor and patch. When minor increases, reset patch.
Retrying a failed unpublished core requires a new full version and sequence.

Production and rollback events require a trusted remote verifier callback.
Require matching version, source commit, artifact digest, Google project/script identity, script version, and fresh publication evidence.
The CLI does not accept a receipt file or a boolean that can declare publication without verification.
The remote verifier is not configured yet. Keep actual product and production operations blocked.
Rollback can target only an artifact previously verified in production. It does not rebuild or change its metadata.

About diagnostics use embedded fields only. Exclude document content, credentials, paths, usernames, and unexpected caller fields.
The shared diagnostic formatter is not a substitute for the future Outcrop About surface and Google-host testing.

## Test-first and completion

1. Write failing persistence, release-transition, diagnostic, and read-only CLI tests.
2. Implement the bounded contracts and preserve all existing checks.
3. Verify corrupt input, source/version mismatch, duplicate attempts, lock contention, and downstream failures.
4. Run the full native package validation and inspect the staged-source command contract.
5. Commit the release milestone before implementing separate Google setup work.
6. Refresh issues #9 and #11 and record verified progress without claiming a release occurred.


## Verification: 2 November 2026

The initial release tests failed because the new interfaces did not exist.
Later failing tests exposed temporary-file collision cleanup, mutable history, and locale-dependent digest ordering.
The fixes preserve earlier data and use deterministic key ordering on macOS and Ubuntu.
All 147 TypeScript tests now pass with 95.66% line coverage. Six real shell checks pass.
The shared package command also runs all retained instruction tests and separate server/browser checks.

No product release record was created. Read-only Markdown inspection reports an empty history.
The actual About UI, product package adapter, remote publication verifier, and Google-host checks remain in issues #9 and #11.
