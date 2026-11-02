<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 7aba2c9f-d977-42b6-a349-fa4aa93d9c1d
Created: 2026
-->

<!-- AGENT: Release history ownership and recovery contract. No product release exists yet. -->

# Release records

Each extension owns a tracked releases/NAME.json history. No production records exist yet.
Inspect a registered extension through `./release.sh --extension markdown`. This command is read-only and requires no Google credentials.

The release engine records candidates, failures, verified production events, and verified rollbacks.
Each candidate preserves the full version, build number, clean source commit, sequence, timestamp, and actual artifact hashes.
The build receives the sequence before it embeds metadata. The engine checks the resulting package before it records a candidate.
Fixture manifests cannot enter production history.

The engine requires a clean checkout and an explicit version that matches the extension's checked-in package version.
The production package adapter must run full validation and the build. No product adapter exists yet.
The CLI cannot mark production from a caller-supplied receipt or an upload result.
A future trusted remote adapter must verify matching Google target and publication state before the engine records production.
The shared diagnostics formatter supplies safe embedded fields for the future Outcrop About surface.

## Source and record commits

Commit source and package-version changes before a production build.
After packaging, review and commit the candidate record in a separate commit before remote release work.
Record verified production state in a later record commit. Keep Google's script version distinct from the application version.
Ordinary builds do not edit records or create commits.

Resolve an active candidate before allocating another candidate.
Use a new build identity and sequence when retrying a failed candidate.
Failed candidates consume sequence numbers, so production sequence numbers can contain gaps.
Advance the semantic version past every previously published core, including after a rollback.
A rollback refers to an original production artifact. It neither rebuilds the artifact nor changes its embedded sequence.

## Integrity and recovery

The storage engine permits only appended events. It validates the complete history before and after each update.
An exclusive lock under releases/.locks/NAME serializes writers for that extension.
The engine syncs a new temporary file before it atomically replaces the history file.
Failed operations preserve the earlier history. Corrupt or unsupported records block writes instead of becoming an empty history.

If a lock remains after an interrupted operation, verify that no release writer is active before removing that specific lock.
Inspect any remaining temporary file before recovery. The engine never removes a pre-existing temporary file after a name collision.
Git history remains the audit trail for reviewed record changes. File validation does not replace repository access controls.
The current file limit is 1 MiB. A larger history requires a reviewed storage migration that preserves all events.

Use stable public failure codes. Do not put credentials, document content, paths, usernames, or raw private errors into records.
Remaining integration and host checks are tracked in issues #9 and #11.
