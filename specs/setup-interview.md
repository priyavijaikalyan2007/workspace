<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: 5131a9df-259d-4481-8a3e-f49a68c5230a
Created: 2026
-->

<!-- AGENT: Accepted decisions and pending questions for the repository setup interview. -->

# Setup interview status

The interview remains in progress. Record accepted decisions separately from proposals and unresolved questions.

## Accepted decisions: 31 October 2026

- Keep repository-specific instructions in ADDITIONAL.md and shared guides reusable across repositories.
- Retain the existing engineering quality bar, including strict test-first implementation and coverage requirements before refactoring.
- Codex performs its own review and validation. The user runs Claude Code separately for independent review.
- Update handoff records after each completed task and before a planned handoff.
- Include completed work, decisions, checks, failures, questions, next actions, accumulated debt, bugs, issues, and follow-up work.
- Track work through GitHub Issues and Projects. Reuse or create the appropriate Project and ask when access or selection is unclear.
- Fix task-introduced debt and defects that block safe completion. Track unrelated debt separately.
- Complete and commit the primary task before starting separate cleanup or follow-up work.
- Complete the shared development setup before implementing extension features or selecting the first Markdown workflow.
- Use npm workspaces, strict TypeScript, esbuild, Vitest coverage, ESLint and Stylistic rules, and repository-pinned clasp.
- Support development on the user's Mac initially. Do not introduce a separately hosted application backend.
- Use Google-hosted Apps Script for the configured add-ons. The user confirmed that this meets the no-backend requirement.

## Accepted decisions: 1 November 2026

- Use plain TypeScript, HTML, and CSS. Prohibit React.
- Prefer Outcrop's documented components and request missing components through the UI team's issue tracker.
- Follow the theme's documented delivery model: live theme and components, with pinned third-party libraries and integrity hashes.
- Use a consistent `--extension <name>` interface. Local builds and tests default to all enabled extensions.
- Require explicit extension and environment selection for remote operations.
- Run local development natively on macOS and the same build and validation scripts directly on Ubuntu CI hosts.
- Require no development or CI containers. Containerized release packaging is not selected.
- Use separate dev and prod Apps Script projects for each extension.
- Make packaging run full validation and build automatically.
- Require clean, committed source and an explicit version for production. Record dirty source state for development uploads.
- Persist release versions in the repository, support injected BUILD_NUMBER values, and display running identity through an About action.
- Use stable SemVer metadata, such as 1.2.37+202611011430.gabc1234, and a separate increasing production release sequence per extension.
- Start with new Google projects and avoid publisher-funded Google Cloud usage for other users.
- Keep billing accounts unlinked and billing disabled. Verify execution identities and shared quota limits before release.

The user selected these controls to reduce mistakes and technical debt when coding agents lose context.
ADDITIONAL.md contains the operating rules. PROJECT_PROFILE.md contains the tool-role assignments and review arrangement.
CONVERSATION.md records the interview requests and response summaries.

## Pending instruction decisions

- Define the first extension workflow under issue #3. Tooling coverage is configured. Product coverage must join validation through issue #4.

## Remaining setup work

The shared framework choices, tool versions, native execution model, and fixture command contract are implemented.
Complete the real product adapter, product scope, and host/release integration through the linked issues.
Use [first-extension readiness](first-extension-readiness.md) to distinguish local implementation, Google-host testing, and production release.
Contribution, conduct, security/support, and licensing work remains tracked under issues #5, #6, and #8.

## GitHub tracking

[Issue #1](https://github.com/priyavijaikalyan2007/workspace/issues/1) tracks the remaining setup interview.
The following issues contain the current work descriptions and completion criteria:

- [Issue #2: profile validation](https://github.com/priyavijaikalyan2007/workspace/issues/2). Fixed and verified locally.
- [Issue #3: first Markdown release](https://github.com/priyavijaikalyan2007/workspace/issues/3).
- [Issue #4: development and validation setup](https://github.com/priyavijaikalyan2007/workspace/issues/4).
- [Issue #5: contribution and conduct policies](https://github.com/priyavijaikalyan2007/workspace/issues/5).
- [Issue #6: security reporting and support](https://github.com/priyavijaikalyan2007/workspace/issues/6).
- [Issue #7: knowledge and handoff records](https://github.com/priyavijaikalyan2007/workspace/issues/7).
- [Issue #8: licensing and attribution](https://github.com/priyavijaikalyan2007/workspace/issues/8).
- [Issue #9: persisted release identity and About diagnostics](https://github.com/priyavijaikalyan2007/workspace/issues/9).
- [Issue #10: retained instruction-test baseline](https://github.com/priyavijaikalyan2007/workspace/issues/10). Fixed and verified locally with all 213 tests passing.

The private [workspace Project](https://github.com/users/priyavijaikalyan2007/projects/1) organizes the tracked work.
PROJECT.md records the tracking destinations. GitHub Projects authorization completed for priyavijaikalyan2007.
The authorization command restored the previously active account, knobbyadmin.
Verified the initial setup issue memberships and the repository link through GitHub. New release work is tracked in issue #9.
The setup interview remains in progress. The remaining setup issues await implementation or user decisions.

## Next action

Begin the local product build/test adapter under issue #4 and define one first workflow under issue #3.
Do not reopen settled framework decisions without a concrete defect or unmet requirement.
The user deferred browser setup and the cmux restart on 3 November 2026. Continue independent local work without restarting their applications.
Actual Apps Script IDs and Cloud linking remain unverified under issue #11. Inspect the earlier creation attempt before creating another project.

## Current verification limits

The product directory contains a planning README, not an add-on implementation.
The shared scripts and fixture pipeline are implemented. Explicit product builds still stop at the planned-source guard.
On 3 November 2026, ./package.sh --fixture passed the full native validation suite and produced a fixture package.
No product build, Google-host test, deployment, publication, or hosted Ubuntu result is claimed.
Existing unrelated initialization changes remain separate from these setup records.

## Implementation progress: 2 November 2026

The first local tooling milestone now has pinned dependencies, working native commands, and a controlled package fixture.
Use SETUP.md for the current command status. Issue #4 remains open for product adapters, iterative product builds, and hosted CI evidence.
Issue #10 is closed after commit 743e83d restored all retained tests without weakening assertions.
Issue #11 tracks remote tooling, billing preflight, and host verification. Issue #9 retains production identity and About work.
The next setup pass must complete those release controls before any product deployment.


## Current readiness: 3 November 2026

The source of current readiness is [first-extension-readiness.md](first-extension-readiness.md).
The next implementation is the local product adapter. The next product decision is one workflow beyond Google's existing features.
Google now documents native Markdown editing as well as import/export. Do not assume basic Markdown support is an unmet requirement.
Browser work remains deferred at the user's request. Publication-only work does not prevent independent local adapter work.
