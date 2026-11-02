#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
# SPDX-FileCopyrightText: 2026 Outcrop Inc
# SPDX-License-Identifier: GPL-3.0-or-later
# Repository: workspace
# File GUID: d4ea098c-245b-4248-af2d-8694ea065ac9
# Created: 2026
# COMPONENT: Native upload entry point
# PURPOSE: Delegate the shared command contract without shell-specific processing.
# RELATES: src/tool/workspace-build/cli.ts, SETUP.md
# FLOW: Resolve repository -> preserve arguments -> propagate Node exit status.

set -euo pipefail
repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$repository_root"
exec node "$repository_root/src/tool/workspace-build/cli.ts" upload "$@"
