<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan 2007, Outcrop Inc, WA, USA
SPDX-License-Identifier: MIT
Repository: workspace
File GUID: 0f22fb10-dc56-4a7e-bce7-52d730a42447
Created: 2026
-->

<!-- AGENT: Project-owned document template. Complete visible TODOs before publication. -->

# Note
This file contains additional instructions that are repository or problem specific. These are
written on observed agent behavior in this repository.

## Instruction ownership

Keep repository-specific instructions in this file. Keep project facts in PROJECT.md and component selections in PROJECT_PROFILE.md.
Keep shared guides reusable across repositories. Address shared-guide defects separately from repository-specific refinements.

## Engineering quality

Follow the existing workflow and testing requirements without reducing the quality bar.
Write tests before implementation code and demonstrate that the new tests fail before implementation.
Before refactoring, establish a passing test baseline and fill coverage gaps to at least 90%.
Run the relevant regression tests and full project validation before reporting completion.
Report failed or unavailable checks explicitly. An unimplemented operation does not count as a passing check.

The strict test-first requirement in instructions/WORKFLOW.md applies in this repository.
The implementation-first allowance for exploratory work in instructions/TESTING.md does not relax that requirement.
These controls address context loss, agent mistakes, and rapid growth of technical debt.

## Independent review

Codex must review its own changes and run the applicable checks before reporting completion.
The user runs Claude Code separately for an independent review pass.
Do not invoke Claude Code or make completion depend on an automatic review handoff.
Do not assume that an independent review occurred without evidence from the user or review results.

## Work tracking and handoffs

Use GitHub Issues and Projects to track tasks, bugs, technical debt, and follow-up work.
Use the repository and Project links in PROJECT.md as the configured tracking destinations.
Check existing items before creating an issue. Reuse the appropriate Project or create one when needed.
If the correct Project or access is unclear, ask the user.
Record each work item as an issue and add the issue to the repository's Project.
Include the impact, completion criteria, dependencies, and known owner or ownership gap.
Keep issue and Project status consistent with verified progress. Link relevant commits and verification evidence.
Keep secrets, private user content, and undisclosed vulnerabilities out of public tracking.

After each completed task and before a planned handoff, update the local project records and relevant GitHub items.
Record completed work, decisions, verification results, known failures, unresolved questions, and the next action.
Include all accumulated bugs, technical-debt items, issues, and follow-up work, with their GitHub links.
Use CONVERSATION.md for requests and response summaries and specs/ for the relevant status and handoff records.
Update agentknowledge/ when the shared workflow requires it. Link tracking items instead of maintaining a competing local backlog.
When resuming work, read the local handoff and refresh the relevant GitHub issue and Project states.

If GitHub is unavailable, preserve pending items and their details in the local status record.
Report the tracking failure and identify unsynchronized items. Synchronize those items when access returns.
Do not claim that tracking is complete until issue creation and Project membership are verified.

## Technical debt and task boundaries

Fix technical debt introduced by the current task and existing defects that block safe completion.
Record unrelated technical debt and follow-up work in GitHub Issues and Projects, including impact, proposed fixes, and priority.
Complete and commit the primary task before starting separate cleanup or follow-up work.

## Setup sequence

Establish the shared development setup before implementing extension features.
Decide and document the languages, frameworks, build tools, test tools, supported developer environments, and release operations first.
Use one documented command contract across extensions. Keep extension-specific configuration and release destinations separate.
Keep agent instructions consistent with the verified root commands and their component implementations.
Distinguish proposed tooling, implemented tooling, local validation, Google-host validation, deployment, and publication.

## Initial development scope

Use the selected development tools recorded in PROJECT.md. Support native macOS development and native Ubuntu CI.
Do not introduce a separately hosted application backend for the initial extensions.
Use Google-hosted Apps Script for the configured add-ons. Browser UI code can call Apps Script for authorized host operations.

## UI architecture and component reuse

Use plain TypeScript, HTML, and CSS. React is prohibited, including React DOM, React UI adapters, and React-specific tooling.
Check dependency and generated artifact contents so React does not enter through another package.
Use the Outcrop component catalog and source locations recorded in PROJECT.md before creating UI components.
Prefer existing components and their documented factories, dependencies, design tokens, keyboard behavior, and lifecycle methods.
Do not substitute raw controls or a local component copy when a suitable library component exists.

If a reusable component is missing or defective, request it through the UI library's GitHub issue tracker.
Include the required behavior, API, accessibility checks, and Google-host constraints. Link that request to the workspace issue.
Continue independent work while the component request remains open. Verify the delivered component before using it.

Follow the library's documented CDN model and the canonical origin recorded in PROJECT.md.
Theme files and components use live URLs. Third-party library assets use versioned URLs and the published integrity hashes.
Do not attach a fixed integrity hash to an always-latest theme or component URL.
Record selected third-party assets and hashes in the build inputs. Include the applicable notices in packaged output.
Review any direct or transitive dependency loaded by a component, including fonts, icons, workers, and dynamic assets.

Target WCAG 2.2 AA in the integrated UI. Verify keyboard behavior, focus, labels, contrast, zoom, reflow, and error announcements.
Test the selected components in Google's HTML-service sandbox. Library claims alone do not establish add-on accessibility or host compatibility.

## Commands and continuous integration

Use the root command contract in specs/development-setup.md as the implementation contract until verified commands enter PROJECT.md.
Use `--extension <name>` consistently for product operations. Local build and test commands default to all enabled extensions.
Require an explicit extension and environment for upload, deployment, publication, and host smoke checks.
Reject unsupported or ambiguous selections before performing an operation.
Keep configure.sh dedicated to instruction configuration and validation.

Configure GitHub Actions to run the same root build and validation scripts directly on an Ubuntu runner for pull requests.
Keep deployment and publication as explicit release operations. Local validation and pull-request checks must not trigger remote releases.

## Release controls and identity

Use separate dev and prod Apps Script projects for each extension.
Make package.sh run full validation and the build before assembling a package. Stop packaging when a required check fails.
Require a clean, committed source checkout and an explicit version for production releases.
Allow development uploads from an uncommitted checkout only when its dirty state is recorded in the build metadata.

Persist the release version and its source identity in the repository. Do not rely only on CI logs or environment variables.
Support an injected BUILD_NUMBER environment variable through the build properties.
Preserve the effective build number in the artifact metadata and repository release record.
Record the actual source commit independently from caller-supplied build identifiers.
Keep candidate builds, failed releases, and verified production releases distinguishable in the release history.

Provide an About action in each production extension that displays the running artifact's version and source identity.
Read application identity from embedded build metadata, not a mutable latest-version endpoint or the current repository branch.
Link bug reports to the full version, extension, environment, and source commit.
Keep the application version distinct from Google's script version number and deployment identifier.
Record independently changing theme assets when diagnosing UI issues. The application's version does not freeze live CDN components.
Use strict SemVer for production, with build identity after the plus sign.
Reset the patch number when major or minor increases. Maintain a separate increasing production release sequence for each extension.
Follow specs/release-versioning.md for build-number inputs, persisted release records, and About diagnostics.

## Publisher resource and billing limits

Start with new Google projects. Keep the publisher's Cloud projects unlinked from billing accounts and verify that billing is disabled.
Do not attach billing accounts, activate paid services, or request paid quota increases without a new explicit user decision.
Check actual billing state after project creation and before upload, deployment, or publication.
Stop remote operations if billing is enabled, linked, or cannot be verified. Do not change billing settings automatically.

Run interactive add-on operations under the current user's authorization.
Do not introduce publisher-owned triggers, service-account execution, or execute-as-owner endpoints to serve other users without reviewing this boundary.
Review quotas at user, script, and API-project levels. Do not assume that user authorization removes shared limits.
Handle exhausted quotas with bounded recovery and clear errors. Do not enable paid capacity as a fallback.

Treat the Google Cloud project as the authorization and publication configuration, not permission to provision a paid application backend.
Keep the existing Outcrop CDN delivery decision explicit. CDN traffic still consumes hosting resources independently from Google project billing.
Review service pricing and the verified billing state before release. Do not claim unlimited usage or zero shared resource consumption.

## Native development and CI portability

Run local edit, build, test, and watch workflows directly on macOS.
Run GitHub Actions build and validation jobs directly on Ubuntu hosts.
Do not require Docker, a development container, or a CI job container for this setup.
Containers are not selected for release packaging either. Consider them only if a concrete release need justifies a later decision.

Use the same root scripts, interfaces, pinned Node.js and npm versions, and lockfile on macOS and Ubuntu.
Keep shell wrappers thin. Put portable processing, filesystem, hashing, and timestamp logic in TypeScript using Node.js APIs.
Avoid dependencies on GNU-only utilities, Homebrew paths, developer home directories, or newer Bash features absent from macOS system Bash.
Install dependencies separately on each operating system. Do not copy node_modules between macOS and Linux.
Verify paths, filename case, argument quoting, exit status, and equivalent package contents under both environments.
