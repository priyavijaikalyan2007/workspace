<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: MIT
Repository: workspace
File GUID: 4546d920-84b6-4255-a73e-e0800f0b2ad3
Created: 2026
-->

<!-- AGENT: Active workspace components and coding-tool roles. -->

# Workspace project profile

## Project files

| Purpose | Path |
| --- | --- |
| Project facts | `PROJECT.md` |
| Additional instructions | `ADDITIONAL.md` |

## Project choices

- [ ] SaaS product

## Components

Each component needs a unique identifier. Duplicate a component section when platforms or languages need separate scopes.
Check Enabled for current work in this repository. Keep possible future products disabled.
For absent literal paths in a new component, add `- Source state: planned` explicitly.
Omitting Source state requires existing paths. Planned scope alone creates no source files or folders.
Optional Source folders lists literal source paths to create as directories after preview and apply approval.
JSON uses source_folders. Keep planned files outside that list and use an empty list to clear it.
First-time interactive setup collects folder creation explicitly. Existing-profile edits preserve their configured paths.
For Workspace components, see [the structured setup fields](instructions/REPO.md#product-specific-workspace-setup).
For browser components, see [browser setup](instructions/REPO.md#product-specific-browser-setup).
Replace angle-bracket values. Use `none` when a field does not apply.
For new components, use [the default source locations](instructions/REPO.md#named-component-convention).
Example names are replaceable. Existing component paths remain authoritative.
Include service-owned database paths and directly copied static source in the components that own them.
Keep Source state: planned explicit for absent paths. Do not enable future components merely to reserve directories.

### backend

- [ ] Enabled
- Source paths: `<backend source and configuration paths>`
- Targets: backend
- Languages: `<Java, C#, or the actual source languages>`
- Platforms: server
- SaaS client: no
- SDK component: none
- Deployment: `<container, server, or configured mode>`

### frontend

- [ ] Enabled
- Source paths: `<browser source paths>`
- Targets: frontend, static-assets
- Languages: `<actual browser source languages>`
- Platforms: browser
- SaaS client: `<yes or no>`
- SDK component: `<SDK identifier or none>`
- Deployment: `<served by application, separate static delivery, or configured mode>`

### sdk

- [ ] Enabled
- Source paths: `<API specification, generator configuration, and output paths>`
- Targets: sdks
- Languages: `<generated output languages affected by the task>`
- Platforms: `<consumer platforms>`
- SaaS client: no
- SDK component: none
- Deployment: generated library

### native-client

- [ ] Enabled
- Source paths: `<native source and target configuration paths>`
- Targets: apps
- Languages: `<actual source languages>`
- Platforms: `<iOS, iPadOS, macOS, Android, ChromeOS, or actual platforms>`
- SaaS client: `<yes or no>`
- SDK component: `<SDK identifier or none>`
- Deployment: native application

### website

- [ ] Enabled
- Source paths: `<static website source paths>`
- Targets: websites, static-assets
- Languages: `<actual website source languages>`
- Platforms: browser
- SaaS client: no
- SDK component: none
- Deployment: `<configured static hosting>`

### documentation

- [ ] Enabled
- Source paths: `<documentation source paths>`
- Targets: documentation
- Languages: none
- Platforms: none
- SaaS client: no
- SDK component: none
- Deployment: `<configured documentation delivery or none>`

### tool

- [ ] Enabled
- Source paths: `<tool source and configuration paths>`
- Targets: tools
- Languages: `<actual tool languages>`
- Platforms: `<supported operating systems>`
- SaaS client: no
- SDK component: none
- Deployment: `<CLI binary, package, or configured mode>`

### instruction-tools

- [x] Enabled
- Source paths: configure.sh, scripts/
- Targets: tools
- Languages: Python, Shell
- Platforms: macOS, Linux
- SaaS client: no
- SDK component: none
- Deployment: local instruction configuration

### workspace-build

- [x] Enabled
- Source paths: src/tool/workspace-build, test, releases, package.json, package-lock.json, workspace.config.json, tsconfig.json, eslint.config.mjs, vitest.config.ts, .node-version, .npmrc, .github/workflows, *.sh
- Targets: tools
- Languages: TypeScript, JavaScript, Shell, HTML, CSS
- Platforms: macOS, Linux
- SaaS client: no
- SDK component: none
- Deployment: local build and validation tools
- Source state: existing

### workspace-extension

- [x] Enabled
- Source paths: src/extensions/googleworkspace/markdown
- Targets: google-workspace
- Languages: JavaScript, HTML, CSS, SCSS, TypeScript
- Platforms: Google Docs
- SaaS client: no
- SDK component: none
- Deployment: apps-script; public installation/distribution
- Workspace model: editor
- Workspace runtime: apps-script
- Workspace account: personal
- Workspace distribution: public
- Source state: planned
- Source folders: src/extensions/googleworkspace/markdown

### browser-extension

- [ ] Enabled
- Source paths: `<extension source, manifest, and build configuration paths>`
- Targets: browser-extensions
- Languages: `<actual languages, such as JavaScript, TypeScript, HTML, CSS, or SCSS>`
- Platforms: `<Chrome, Firefox, Safari with operating systems, or actual browsers>`
- SaaS client: no
- SDK component: none
- Deployment: `<unpacked test extension, browser store packages, or Safari app distribution>`

## Agent roles

Use [shared role definitions](instructions/AGENT_ROLES.md).

| Tool | Roles | Notes |
| --- | --- | --- |
| codex | general, implementation, planning, architecture, review, testing, security, ux, documentation, operations, product | Codex serves as the implementation coding agent. |
| claude | general, testing, security, review | Claude Code plays the reviewer role. |

Codex performs its own review and validation. The user runs Claude Code separately for independent review.
These assignments do not request an automatic handoff or invocation of another coding tool.
