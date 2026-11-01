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

- Define the coverage measurements and scope that enforce the existing 90% requirement.

## Remaining setup work

- Confirm the languages, development tools, test runner, source layout, and generated output policy.
- Implement and verify shared project operations after the toolchain decisions.
- Align instructions and documentation with the verified script commands across extensions.
- Define the initial Markdown workflow, supported features, success criteria, and exclusions after the shared setup.
- Complete contributor, conduct, security, and support policies through the interview.
- Establish relevant knowledge records without inventing application models or past decisions.

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

Continue the shared development setup interview under issue #4 using specs/development-setup.md.
Implement the shared tooling with the accepted version policy and explicit dev/prod configuration boundaries.
Project identifiers and credentials remain unconfigured. Local tooling and controlled tests must not require Google credentials.
Project creation and remote operation checks must preserve the no-billing constraint. No Google projects were created during the interview.
Keep issue #3 pending until the shared setup is ready.

## Current verification limits

The source directory is empty. No product build or test suite exists.
Profile validation now passes. The missing explicit SaaS choice is restored as unchecked, preserving the standalone extension configuration.
This check validates instruction routing, not product readiness.
The root build and test scripts are placeholders that exit with status 2.
Existing uncommitted setup changes predate the interview and must remain separate from the interview additions.
