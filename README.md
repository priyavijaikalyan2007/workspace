<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan 2007, Outcrop Inc, WA, USA
SPDX-License-Identifier: MIT
Repository: workspace
File GUID: fa81828e-3581-4298-887e-08568a2c2a33
Created: 2026
-->

<!-- AGENT: Repository overview and verified native development entry points. -->

# workspace

This repository will contain Google Workspace extensions. The first planned extension is a Google Docs Editor add-on named Markdown.
Product features are not implemented. The shared local toolchain can validate, build, and package a controlled fixture.

## Start development

Use Node.js 26.12.1, npm 11.20.0, and Python 3.15.2. Local development runs directly on macOS.
The Ubuntu workflow uses the same versions and root commands. Containers are not required.

1. Install the pinned dependencies:

   ```sh
   npm ci
   ```

2. Validate the repository:

   ```sh
   ./test.sh
   ```

3. Build the shared tools:

   ```sh
   ./build.sh
   ```

4. Validate and package the local fixture:

   ```sh
   ./package.sh --fixture
   ```

The fixture proves local artifact handling. It does not implement Markdown or prove compatibility with Google's host.
Read [SETUP.md](SETUP.md) for outputs, command limits, and remaining setup work.
Use `npm exec vitest` for native test watch mode during development.
Use `./release.sh --extension markdown` for read-only release inspection.
Google billing checks use `preflight.sh` and the explicit saved publisher account. See SETUP.md for the command and limits.

## Architecture and policies

The stack uses strict TypeScript, HTML, CSS, esbuild, Vitest, and ESLint.
Apps Script and browser code have separate type checks and bundles. React is prohibited.
Product UI will use the Outcrop components at https://static.outcrop.us/docs/.

Read [PROJECT.md](PROJECT.md) for project facts and [AGENTS.md](AGENTS.md) for agent instructions.
The [setup issue](https://github.com/priyavijaikalyan2007/workspace/issues/4) tracks remaining tooling work.
The [workspace Project](https://github.com/users/priyavijaikalyan2007/projects/1) organizes issues and follow-up work.

Repository policies remain under [contributing](CONTRIBUTING.md), [conduct](CODE_OF_CONDUCT.md),
[security](SECURITY.md), and [licensing](LICENSE). Their remaining setup decisions are listed in SETUP.md.
