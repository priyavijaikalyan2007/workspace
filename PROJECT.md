<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: MIT
Repository: instructions
File GUID: 64e42bd9-c0cb-415b-a0d6-e7dfa6b6105d
Created: 2026
-->

<!-- AGENT: Project-specific facts about the instruction library. -->

# Instruction repository information

## Identity and purpose

| Fact | Value |
| --- | --- |
| Repository | instructions |
| Product | Generic coding-agent instructions and repository analysis tools |
| Source | instructions/, root agent entries and project files, scripts/, and agentknowledge/ |
| Review history | Git history and merged pull requests in priyavijaikalyan2007/instructions |
| Application runtime | none |
| Generic build.sh or test.sh | absent |

## Source and configuration

| Subject | Fact |
| --- | --- |
| Generic entry point | AGENTS.md |
| Shared agent workflow | instructions/WORKFLOW.md |
| Agent entry files | CODEX.md, CLAUDE.md, GEMINI.md |
| Project selections | PROJECT_PROFILE.md |
| Local refinements | ADDITIONAL.md |
| Plan and status | instructions/maintenance/instructions-plan.md, instructions/maintenance/instructions.status.md |
| Profile selector | configure.sh, Python 3.10+, Bash, Python standard library |
| Selector test command | python3 -m unittest discover -s scripts/tests -v |
| Selector read-only check | ./configure.sh --check |
| Repository-tool documentation | instructions/REPO_TOOLS_README.md |
| Knowledge records | agentknowledge/history.jsonl and agentknowledge/lcv_constraints.yaml |
| Source encoding | instructions/frontend/FRONTEND.md and instructions/DOCUMENTATION.md use CP1252. Most other guides use UTF-8. |

## Scope facts

The language snippets are examples for consuming projects. They are not a deployed application in this repository.
The current change has no Java server, browser application, generated SDK, or native application artifact to build.
The profile configurator is a local Python CLI with a Bash entry point and isolated filesystem integration tests.
The Java SaaS profile under instructions/maintenance/examples/ is a fictional instruction-routing fixture.

The interview supports eight product categories, including Google Workspace and browser extensions.
Microsoft Office extension profiles are deferred. No extension host application exists in this repository.

Project initialization: --initialize-project with optional --project-answers JSON.
License texts: pinned SPDX license-list-data v3.29.0, installed without runtime network access.
Source baseline check: python3 scripts/update_template_baseline.py.

Workspace setup collects structured hosts, model, runtime, account, and distribution choices.
Planned literal source paths are supported through an explicit source_state field.

New-component layout defaults are documented in REPO.md and each selected target guide.
The interview offers named source-path examples only when a concrete component path is absent.
This instruction repository retains its established scripts/ and scripts/tests/ paths.

Apps Script runtimes select a runtime-specific guide alongside shared JavaScript rules.
TypeScript source additionally selects TypeScript guidance. HTTP runtimes do not imply Apps Script.

Browser setup records supported browser/OS pairs and a typed distribution mode.
Language and platform menus use supported choices from scripts/profile_choices.py.
Native apps, tools, and generated SDKs select platforms before their contextual language lists.
Existing unlisted values receive an explicit Keep existing option. Manual and JSON coverage validation remains available.
First-time interactive setup records approved folder creation in optional source_folders metadata.
Extension defaults use src/extensions/googleworkspace/markdown and src/extensions/browser/markdown.
Those example names are replaceable. Existing configured paths retain their values.
Terminal output supports --color auto, always, and never without external dependencies.

Project-owned context files now reside at the repository root. Initialization metadata uses .instructions/.
The selector supports --target-folder for local tests without a Git repository or existing directory.
Tools can have multiple roles recorded in PROJECT_PROFILE.md. Shared definitions live in instructions/AGENT_ROLES.md.
Project initialization captures optional business facts and creates missing profile-specific operation placeholders and SETUP.md.
For new backend components, the environment model uses test locally, dev for staging, and prod for production.
Single-license output keeps full terms in root LICENSE when no companion or separate content terms are required.

Interactive terminal interviews use Python curses forms. Plain and forced-curses modes are explicit --ui choices.
PTY checks cover cursor editing, forward Delete, Backspace, choice selection, terminal resize, review, apply, and cancellation.
Curses remains optional. JSON and redirected invocations retain plain output.

## Work tracking

Track tasks, bugs, technical debt, and follow-up work in [GitHub Issues](https://github.com/priyavijaikalyan2007/workspace/issues).
Use the private [workspace Project](https://github.com/users/priyavijaikalyan2007/projects/1) to organize those issues.
[Issue #1](https://github.com/priyavijaikalyan2007/workspace/issues/1) tracks the setup interview and links the remaining setup work.
Keep local status and handoff records linked to these tracking items, as ADDITIONAL.md requires.

## Selected development tools

The user selected npm workspaces, strict TypeScript, esbuild, Vitest with coverage, ESLint with Stylistic rules, and repository-pinned clasp.
These tools will provide a common setup across extensions. Tool versions and the repository toolchain are not yet installed or verified.
The initial supported development environment is the user's Mac. No separately hosted application backend is planned.
Google-hosted Apps Script is accepted for add-on execution. The configured Google Docs integration remains an Editor add-on.
Browser UI code and Google-hosted document operations use separate build boundaries. No application server is required outside Google's platform.
Record the remaining UI and release decisions in specs/development-setup.md before implementing their configuration.

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
GitHub Actions will run the same root validation and build scripts on macOS for pull requests.
These interfaces and checks are accepted but not implemented. The intended contract is in specs/development-setup.md.

## Release controls and version identity

Each extension will use separate dev and prod Apps Script projects. Project identifiers and credentials are not configured yet.
package.sh will run full validation and build automatically. Production requires a clean, committed source checkout and an explicit version.
Development uploads may use uncommitted source when the artifact records that state.

The release identity must connect the full version, effective BUILD_NUMBER, source commit, artifact, and verified production state.
Persist this identity in repository records and embed the running version in an About surface.
GitHub CI and release builds may supply BUILD_NUMBER through the build properties.
Use strict SemVer with stable build metadata, such as 1.2.37+202611011430.gabc1234.
Maintain a separate increasing production release sequence per extension. The patch number follows SemVer reset rules.
The release-record and About requirements are recorded in specs/release-versioning.md.
