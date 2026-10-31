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
