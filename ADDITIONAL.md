<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: MIT
Repository: instructions
File GUID: 2068cedb-a7d0-49d2-bc8d-7b1d2c992528
Created: 2026
-->

<!-- AGENT: Local documentation-maintenance instructions and lessons for this repository. -->

# Instruction repository refinements

## Documentation changes

- Preserve the existing encoding and copyright header of each edited guide.
- Keep language and target callouts when moving their detailed instructions to a canonical guide.
- Check Markdown links, heading anchors, and code-example preservation after guide changes.
- Record a changed policy explicitly rather than describing it as a content-only move.
- Keep historical conversation and audit findings intact. Add dated correction status when later work resolves them.
- Keep application examples distinct from the instruction repository's own active component choices.

## Emerging lessons

Record new project-local findings here when they are not yet covered by a generic guide.
Propose reusable changes to the guide that owns the subject and preserve remaining project-specific details.

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
