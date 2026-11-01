<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 2cb61b5b-8493-4da0-8191-261d085ef76c
Created: 2026
-->

<!-- AGENT: Release identity requirements, SemVer decisions, and repository persistence design. -->

# Release versions and production identity

[Issue #9](https://github.com/priyavijaikalyan2007/workspace/issues/9) tracks implementation alongside the shared setup in issue #4.

## Accepted requirements

The user requires a version scheme based on SemVer 2.0 with major, minor, revision, and build identity.
The usual build identity contains a YYYYMMDDhhmm timestamp and Git commit identifier.
Use strict SemVer: the patch number increments for patch releases and resets when major or minor increases.
Maintain a separate production release sequence that increases across production releases of each extension.
The full version must persist in the repository and identify the artifact and source associated with an issue.

Support an injected BUILD_NUMBER environment variable through the build properties for CI and release builds.
Persist the effective value in the artifact and repository release record. Do not rely only on transient CI output.
Record the actual full source commit separately, even when a shorter identifier appears in the display version.

Use separate dev and prod Apps Script projects per extension.
Run validation and build as package prerequisites. Production requires clean committed source and an explicit version.
Record dirty source state for development builds. Do not publish those builds as clean production artifacts.

## Selected version policy

The user selected the stable-release shape 1.2.37+202611011430.gabc1234.
Use major.minor.patch+BUILD_NUMBER.gCommitId for production. The commit identifier comes from the actual source checkout.
Do not place the production build identity after a dash, because that marks a SemVer prerelease.
Build metadata does not determine SemVer precedence.
Each new production artifact must advance the SemVer core. Changing only build metadata does not establish a newer production release.

Strict SemVer resets the patch number when major or minor increases.
A separate monotonically increasing production release sequence preserves release order across major and minor changes.
Store the sequence separately from the SemVer string and show both in About and release records.

Use UTC and a 24-hour clock for generated timestamp build numbers.
Use the injected BUILD_NUMBER environment value first, then a configured build property, then the generated UTC timestamp.
The default timestamp format is YYYYMMDDhhmm. BUILD_NUMBER may instead contain a valid CI build identifier.
Validate the supplied value as SemVer build metadata identifiers. Append the source Git identifier separately.
Reject malformed values instead of silently changing them. Record the effective input and source commit in full.
An injected build identifier must not hide or replace the actual source commit.

## Persistence design for implementation

Keep each extension's editable base version in its checked-in package version field, without duplicating that authority in another file.
Generate immutable build metadata once during packaging and embed it in both server and browser artifacts.
Persist a repository release record containing the complete version, BUILD_NUMBER, source commit, artifact hashes, environment, and release status.
Record Google's script version and deployment identity separately when those values become available.
Mark a release as production only after the applicable deployment and publication state is verified.

Keep the source commit and the commit that records a release distinguishable.
A tracked file cannot contain the hash of its own enclosing commit without changing that hash again.
A separate release-record commit can preserve the complete built version while referring to the original clean source commit.
Ordinary build commands should not edit tracked version files implicitly or make their own source checkout dirty.
Serialize production releases per extension and reject duplicate version or sequence assignments.
Record rollbacks as deployment events that refer to the original artifact. Do not rewrite that artifact's embedded identity.

## About and issue diagnostics

Provide an About action in each production extension that shows the running artifact's embedded identity.
Include extension name, complete application version, production release sequence, build number, source commit, build time, environment, and dirty-source state.
Show the timestamp time zone explicitly.
Allow users to copy these safe diagnostic fields for issue reports.
Do not include document content, credentials, developer usernames, machine names, or other unnecessary private build details.
Do not replace the running identity with the latest version from GitHub, a mutable property store, or a release endpoint.

Live theme files and components can change independently from the application version.
Record observed theme build identifiers where the library exposes them and distinguish them from application identity.
Reuse the selected Outcrop components for the About surface where suitable. Request a shared component only when a gap is demonstrated.

## Verification requirements

- Verify accepted and rejected versions against the selected policy.
- Verify revision changes, build-number overrides, timestamp interpretation, and duplicate release handling.
- Reject production builds from dirty source or mismatched source metadata.
- Verify that package validation failures prevent package creation.
- Verify identical embedded identity across the server artifact, browser artifact, package metadata, and repository release record.
- Verify that retries do not silently replace an existing version with different bytes.
- Distinguish candidate records, failed releases, completed releases, and production rollback events.
- Verify that About reports its actual deployed version and copies only the intended diagnostic fields.
- Preserve the previous production record until a replacement is verified.

## Source references

- [SemVer 2.0](https://semver.org/spec/v2.0.0.html).
- [Apps Script versions](https://developers.google.com/apps-script/guides/versions).
- [Apps Script deployments](https://developers.google.com/apps-script/concepts/deployments).
