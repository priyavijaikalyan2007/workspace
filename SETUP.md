<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: MIT
File GUID: 6000d3e9-da2d-4b74-b115-f073e49f10c4
Created: 2026
-->

<!-- AGENT: Verified setup state, command contract, and release boundaries. -->

# Development setup

Current start criteria and the next local task are in [first-extension readiness](specs/first-extension-readiness.md).

The local toolchain runs natively on macOS. GitHub Actions runs directly on Ubuntu 24.04.
The hosted workflow is configured but has not run for these unpushed changes.

## Prerequisites

Use Node.js 26.12.1 and npm 11.20.0. The engine rules reject other versions during installation.
Use Python 3.15.2 for the retained instruction tests. No Google credentials or theme checkout are needed for local commands.
Install dependencies separately on each operating system through `npm ci`. Do not copy node_modules between systems.

## Verified commands

| Command | Result |
| --- | --- |
| `./configure.sh --check` | Validate the selected instructions. This does not validate product behavior. |
| `./test.sh` | Check instructions, dependency policy, TypeScript, ESLint, coverage, shell tests, and retained Python tests. |
| `./build.sh` | Build shared tooling and report planned product extensions. |
| `./build.sh --fixture` | Build the controlled Apps Script and browser fixture. |
| `./package.sh --fixture` | Run full validation and build, then create a local fixture package with file hashes. |
| `./clean.sh` | Remove build and dist only when their ownership markers match. Preserve unowned directories. |
| `./release.sh --extension markdown` | Inspect release history without modifying it or contacting Google. |
| `npm exec vitest` | Watch TypeScript tooling tests during native development. |

Use `--help` on each root operation. Errors return status 1. Help returns status 0.
The wrappers work through macOS system Bash 3.2 and preserve arguments and failure status.

`--extension markdown` currently fails because the extension is planned.
The default build reports this limit instead of treating an empty directory as a successful product build.
The local adapter supports implemented extensions. See [the product adapter contract](specs/product-adapter.md).
Incremental product builds remain part of [issue #4](https://github.com/priyavijaikalyan2007/workspace/issues/4).

## Inputs and outputs

The registry is workspace.config.json. Package versions define their base versions.
For the local fixture, the root package version applies unless `--version X.Y.Z` overrides it.
BUILD_NUMBER overrides buildProperties.buildNumber in the registry. Without either value, the build uses UTC YYYYMMDDhhmm.
The actual full Git commit and dirty state remain separate metadata fields.

Shared tooling writes build/tooling. Fixture output goes under build/fixture.
Only Code.gs, Index.html, and appsscript.json enter its apps-script directory.
The sibling build-info.json records the identity embedded in both bundles.
Packages go under dist/fixture-VERSION and include manifest.json containing SHA-256 file hashes.
Existing package names cannot be overwritten. Use another build number or remove verified generated output through clean.sh.
Generated outputs and local Google configuration files are ignored by Git.

## Remaining release work

Upload, deploy, publish, and host smoke commands require explicit extension and environment selections.
These commands stop before remote work because Apps Script IDs, product host integration, and an authorized release client remain unconfigured.
Production local commands remain blocked until production product integration and a trusted publication verifier are configured.
The shared release engine and safe diagnostic formatter are implemented. See releases/README.md.
Two standard Cloud projects now exist. One Apps Script creation was initiated, but its ID and final state remain unverified.
No Markdown upload, deployment, or publication was performed.

The selected clasp tool is deferred because its current dependency graph introduced audit findings.
The local lockfile excludes clasp and pins minimatch 11.0.1 to resolve the lint graph findings.
The current dependency audit reports zero vulnerabilities. Recheck advisories before releases.
Do not override incompatible major versions inside clasp to hide findings.

Remaining work is tracked in:

- [Issue #4](https://github.com/priyavijaikalyan2007/workspace/issues/4): product activation, incremental builds, and hosted Ubuntu verification.
- [Issue #9](https://github.com/priyavijaikalyan2007/workspace/issues/9): persisted release records, production gates, and About diagnostics.
- [Issue #11](https://github.com/priyavijaikalyan2007/workspace/issues/11): remote tooling, billing checks, and Google-host verification.
- [Issue #3](https://github.com/priyavijaikalyan2007/workspace/issues/3): product scope after the shared setup.
- [Issue #5](https://github.com/priyavijaikalyan2007/workspace/issues/5): contribution and conduct.
- [Issue #6](https://github.com/priyavijaikalyan2007/workspace/issues/6): private security and support contacts.
- [Issue #8](https://github.com/priyavijaikalyan2007/workspace/issues/8): licensing review and dependency notices.

The full release policy remains in [specs/release-versioning.md](specs/release-versioning.md).


## Live Google billing preflight

The Markdown Cloud targets are recorded in workspace.config.json:

| Environment | Project ID | Project number |
| --- | --- | --- |
| dev | outcrop-markdown-dev-8be3bf5 | 134157199372 |
| prod | outcrop-markdown-prod-8be3bf5 | 468067001295 |

Live checks on 2 November 2026 verified billingEnabled=false and an empty billingAccountName for both projects.
These saved observations are historical evidence. Every preflight fetches fresh billing state.
The commands require the Google Cloud CLI and its saved publisher account. Set GOOGLE_ACCOUNT explicitly for each invocation:

```sh
GOOGLE_ACCOUNT=publisher@example.com ./preflight.sh --extension markdown --environment dev
GOOGLE_ACCOUNT=publisher@example.com ./preflight.sh --extension markdown --environment prod
```

Replace the example email with the saved publisher account. The command does not change the default gcloud account or project.
The command rejects enabled billing, any billing link, missing fields, a mismatched project, or an unverifiable response.
A closed billing account still counts as a prohibited link. Command failures exclude raw CLI output from diagnostics.
The live query has a 20-second timeout. The check neither changes billing nor creates a deployment.

Both preflight runs reported scriptConfigured=false. A successful billing check does not establish release readiness.
The publisher account was verified in the user-specified testing profile.
Only the other Chrome profile is connected to browser control. Native control changed windows and was interrupted.
Project creation was initiated once. Inspect My Projects before creating another project. Script IDs and Cloud linking remain unverified.
The current control options and next steps are in specs/google-project-setup.md.
Google documents this limitation in its [Apps Script troubleshooting guide](https://developers.google.com/apps-script/guides/support/troubleshooting).


The user selected connecting the testing profile to browser control.
Complete the ChatGPT extension installation in that profile through the desktop app's Settings > Computer Use flow.
The agent cannot operate its own app settings or Chrome's internal extension-management page because tool security policies block both routes.
The [official extension setup guide](https://learn.chatgpt.com/docs/chrome-extension) describes the supported flow.


## Browser work deferred: 3 November 2026

The user is not ready to quit and restart cmux for the screen-recording permission change.
Keep browser setup deferred. Do not restart the application to remove this blocker.
Continue local tooling, scope decisions, and repository work without Google credentials or browser control.
A fresh ./package.sh --fixture run passed the local validation and packaging checks on 3 November 2026.
The earlier Apps Script creation remains unverified. Inspect it before any future creation attempt.


## Local product adapter: 5 November 2026

Registered, implemented extensions now use the root build, test, and development package commands.
The adapter reads each extension's package version and preserves named Apps Script callbacks.
It supports server-only products and optional, separate browser bundles. It does not require a sidebar.
Each extension receives isolated runtime type checks, lint, and its own coverage gate.
See [the adapter contract](specs/product-adapter.md) for inputs, outputs, commands, and current limits.

Markdown remains planned. No Markdown product artifact or Google-host success is claimed.
The full fixture package passed 218 TypeScript tests, seven shell checks, and 213 retained Python tests.
Tooling line coverage was 96.42%. Real native tests passed for synthetic server-only and browser-enabled source.
An untested synthetic source file failed the separate product coverage gate as expected.
Incremental product build watching, hosted Ubuntu execution, product UI, and release integration remain pending.

Native Chrome access recovered after the computer restart on 5 November 2026.
The existing Untitled script was found and its ID verified. Its Cloud association still reads Default.
Dev/prod pairing and automatic document behavior remain unverified. See [the recovery record](specs/google-project-setup.md).
Browser-tab control still reports an unavailable access host. Native inspection works.
