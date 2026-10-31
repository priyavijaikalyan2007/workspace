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

The user selected these controls to reduce mistakes and technical debt when coding agents lose context.
ADDITIONAL.md contains the operating rules. PROJECT_PROFILE.md contains the tool-role assignments and review arrangement.
CONVERSATION.md records the interview requests and response summaries.

## Pending instruction decisions

- Define the coverage measurements and scope that enforce the existing 90% requirement.
- Define the handoff records that an agent must maintain when context or sessions change.
- Define how an agent handles technical debt that falls outside the current task.

## Remaining setup work

- Repair the missing explicit SaaS product choice and rerun profile validation.
- Define the initial Markdown workflow, supported features, success criteria, and exclusions.
- Confirm the languages, development tools, test runner, source layout, and generated output policy.
- Implement and verify project operations after the product and toolchain decisions.
- Complete contributor, conduct, security, and support policies through the interview.
- Establish relevant knowledge records without inventing application models or past decisions.

## Current verification limits

The source directory is empty. No product build or test suite exists.
Profile validation reports a missing SaaS product checkbox.
The root build and test scripts are placeholders that exit with status 2.
Existing uncommitted setup changes predate the interview and must remain separate from the interview additions.
