<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan 2007, Outcrop Inc, WA, USA
SPDX-License-Identifier: MIT
Repository: workspace
File GUID: a46fb4ba-0da8-4a73-a7e4-e49a61a898b8
Created: 2026
-->

<!-- AGENT: Current workspace facts and verified command status. -->

# workspace project facts

| Fact | Value |
| --- | --- |
| Project | workspace |
| Owner | Priya Vijai Kalyan 2007, Outcrop Inc, WA, USA |
| Repository | https://github.com/priyavijaikalyan2007/workspace |
| Purpose | Useful extensions for Google Workspace. |
| Intended users | Everyone who uses Google Workspace such as GMail, Google Docs, Sheets etc. |
| User problem | Extensions to full gaps such as markdown support in Google Workspace. |
| Expected value | Productivity gains. |
| Initial scope | First workflow awaits the interview in issue #3. The Markdown component remains planned. |
| Success criteria | Product acceptance criteria await issue #3. Local fixture verification is recorded below. |
| Constraints and exclusions | Native macOS development, native Ubuntu CI, no React or hosted backend, and unbilled Google targets. See ADDITIONAL.md. |
| Build and test commands | ./build.sh, ./test.sh, and ./package.sh --fixture. See SETUP.md for limits. |
| Architecture | Native TypeScript build CLI and retained instruction configurator. Product extension remains planned. |
| Source locations | Recorded in the component profile linked below |
| Database migration ownership | None. No application database is selected. |
| Component and cross-component tests | src/tool/workspace-build/test, test/shell, scripts/tests. Run ./test.sh. |
| Source and generated output mapping | src/tool/workspace-build and test/fixtures/googleworkspace produce owned build/ and dist/ output. |
| Deployment | Dev/prod projects selected. Cloud IDs and live billing checks are configured. Apps Script IDs and remote adapters remain unconfigured. |

Component selections are in [PROJECT_PROFILE.md](<PROJECT_PROFILE.md>).
Local refinements are in [ADDITIONAL.md](<ADDITIONAL.md>).
Licensing choices and attribution scope are recorded in the root LICENSE and THIRD_PARTY_NOTICES.md.

Setup status is recorded in SETUP.md. Local fixture operations are verified. Product operations and Google-host behavior remain unverified.

## Work tracking

Track tasks, bugs, technical debt, and follow-up work in [GitHub Issues](https://github.com/priyavijaikalyan2007/workspace/issues).
Use the private [workspace Project](https://github.com/users/priyavijaikalyan2007/projects/1) to organize those issues.
[Issue #1](https://github.com/priyavijaikalyan2007/workspace/issues/1) tracks the setup interview and links the remaining setup work.
Keep local status and handoff records linked to these tracking items, as ADDITIONAL.md requires.

## Selected development tools

The user selected npm workspaces, strict TypeScript, esbuild, Vitest with coverage, ESLint with Stylistic rules, and repository-pinned clasp.
The local tools are installed through the root lockfile. Clasp remains deferred under issue #11 because its dependency graph introduced audit findings.
The initial supported development environment is the user's Mac. No separately hosted application backend is planned.
Google-hosted Apps Script is accepted for add-on execution. The configured Google Docs integration remains an Editor add-on.
Browser UI code and Google-hosted document operations use separate build boundaries. No application server is required outside Google's platform.
Selected UI and release decisions remain in specs/development-setup.md. Their implementation status is recorded in SETUP.md.

## UI components and delivery

The UI uses plain TypeScript, HTML, and CSS. React is prohibited.
The selected library is Outcrop's enterprise theme and component collection, built around Bootstrap 5 customizations.
Use the component documentation at https://static.outcrop.us/docs/ and the canonical asset origin https://static.outcrop.us/.
Inspect local component source at /Users/vijaikalyan/Work/pvk2007/theme.
The library's upstream repository and UI-team issue tracker are https://github.com/priyavijaikalyan2007/b2btheme.

Follow the documented CDN model: theme files and components are live, while vendored third-party libraries use versioned URLs and integrity hashes.
The dependency manifest is https://static.outcrop.us/lib-manifest.json.
The integrated add-on targets WCAG 2.2 AA. Actual accessibility and HTML-service compatibility remain unverified.
The theme repository is an inspection source, not an absolute-path dependency for workspace builds or CI.

## Command and CI decisions

Use `--extension <name>` for product operations. Local build and test commands default to all enabled extensions.
Remote operations require an explicit extension and environment. Keep instruction configuration separate in configure.sh.
GitHub Actions will run the same root validation and build scripts directly on Ubuntu for pull requests.
The local tooling contract is implemented for shared tools and a controlled fixture. Product adapters and remote operations remain pending.

## Release controls and version identity

Each extension will use separate dev and prod Apps Script projects. Cloud project IDs are configured. Script IDs and release credentials remain unconfigured.
package.sh runs full validation and build for the local fixture. Production commands remain blocked pending product and remote adapter integration.
Development uploads may use uncommitted source when the artifact records that state.

The release identity must connect the full version, effective BUILD_NUMBER, source commit, artifact, and verified production state.
Persist this identity in repository records and embed the running version in an About surface.
GitHub CI and release builds may supply BUILD_NUMBER through the build properties.
Use strict SemVer with stable build metadata, such as 1.2.37+202611011430.gabc1234.
Maintain a separate increasing production release sequence per extension. The patch number follows SemVer reset rules.
The release-record and About requirements are recorded in specs/release-versioning.md.

## Google project and cost boundaries

New separate dev/prod standard Cloud projects were created on 2 November 2026. Live checks verified disabled billing and no billing-account links.
Each extension will use separate dev and prod Apps Script projects. Public production add-ons require their own standard Google Cloud project.
Cloud projects provide authorization, API configuration, and Marketplace identity. They do not imply an application server deployment.

The publisher must not pay Google Cloud usage charges for other users' extension activity under the initial design.
Keep billing accounts unlinked and billing disabled. Do not provision paid services or enable paid quota increases.
Interactive operations run as the current user. Per-user quotas coexist with shared script and API-project limits.
Outcrop CDN resource usage remains separate from Google Cloud billing under the selected live-asset model.
Google's Docs API limits page currently announces planned paid overages. Recheck applicable pricing before release.

## Development and CI execution

Local development, iterative builds, tests, and watch commands run natively on the user's Mac.
GitHub Actions runs the same root build and validation commands natively on Ubuntu hosts.
No development container or CI job container is required or selected.
The earlier macOS CI selection is superseded by native Ubuntu CI with macOS local verification.
Use pinned tools and a shared lockfile, with a separate dependency installation for each operating system.
Containerized final packaging is not selected. The user considers containers potentially suitable for final release work, not iterative local development.

## Verified instruction-tool checks

On 1 November 2026, ./configure.sh --check passed.
The command python3 -m unittest discover -s scripts/tests -q passed all 213 retained instruction-tool tests.
These checks validate retained configuration tooling. The local fixture milestone below validates separate application tooling.

## Verified local tooling

The installed versions are Node.js 26.12.1, npm 11.20.0, TypeScript 6.0.3, esbuild 0.28.2, and Vitest 5.0.5.
ESLint 10.14.0 uses typescript-eslint 8.72.1 and Stylistic 5.10.0. Python 3.15.2 runs retained configuration tests.
The root lockfile pins the resolved graph. The minimatch 11.0.1 override fixes current lint dependency findings.
No React package is permitted in the lockfile graph. Clasp is not installed in this local toolchain.

The native Mac fixture package passed full validation on 1 November 2026.
Further failure-boundary tests on 2 November 2026 passed 81 TypeScript tests with 96.28% line coverage.
Five BATS checks verify the real root wrappers. The retained Python suite contains 213 passing tests.
Server and browser fixture sources pass separate type checks. The fixture uses no product UI or external component library.
The repository-wide product build reports planned Markdown source instead of claiming a product artifact exists.

The Ubuntu 24.04 workflow uses the same pinned versions and ./package.sh --fixture command.
Its execution remains unverified until an authorized push. No push, Google upload, deployment, or publication occurred.

A staged-source snapshot also passed the complete fixture package command from a path containing spaces on 2 November 2026.
All four recorded file hashes matched the packaged bytes. The real clean command removed only owned generated output.
A planned component README preserves the required source directory in fresh checkouts.


## Release persistence foundation

On 2 November 2026, the shared release engine passed 147 TypeScript tests at 95.66% line coverage.
Tracked per-extension records preserve candidate identity, failure codes, verified production observations, and rollback events.
The engine verifies actual package hashes and source state. The read-only release.sh command inspects registered extension histories.
No real product release exists. Product adapters, trusted Google publication observation, and the Outcrop About surface remain pending.


## Google project configuration

The development Cloud project is outcrop-markdown-dev-8be3bf5, number 134157199372.
The production Cloud project is outcrop-markdown-prod-8be3bf5, number 468067001295.
Both were created with the Cloud APIs auto-enable flag disabled. No billing account was linked or billing configuration changed.
The new preflight.sh command verified live unbilled state in both environments and reported that script IDs remain unconfigured.
The recorded check times were 2 November 2026 at 07:04:12 UTC for dev and 07:04:25 UTC for prod.

The publisher account was verified in the user-specified testing Chrome profile. One script creation was initiated, but the resulting ID remains unverified.
Stable control of that profile is pending after native Chrome control changed windows. Product adapters, host verification, and the About surface remain pending.
Current local validation includes 176 TypeScript tests, seven shell checks, and 213 retained Python tests.
Tooling line coverage is 95.86%. Hosted Ubuntu verification still awaits an authorized push.


## First extension readiness: 3 November 2026

The shared local foundation passed fresh fixture packaging with all 176 TypeScript, seven shell, and 213 Python checks.
The next engineering task is the real product build/test adapter. Product-feature implementation also needs an agreed first workflow.
The current milestones and acceptance gates are in [specs/first-extension-readiness.md](specs/first-extension-readiness.md).
The user deferred the cmux restart and browser setup. Independent local work can continue.
Google-host testing and production release remain separate, incomplete milestones.
