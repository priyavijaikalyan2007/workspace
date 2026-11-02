#!/usr/bin/env bats
# SPDX-FileCopyrightText: 2026 Outcrop Inc
# SPDX-License-Identifier: GPL-3.0-or-later
# File GUID: 6a39af99-927b-48ba-854b-d742bf3d113d
# COMPONENT: Root command integration
# PURPOSE: Verify macOS-compatible wrappers and failure boundaries.
# RELATES: src/tool/workspace-build/runner.ts
# FLOW: Execute real commands -> assert status and actual output.

setup()
{
    repository_root="$(cd "${BATS_TEST_DIRNAME}/../.." && pwd)"
}

@test "all wrappers support help through macOS system Bash" {
    for operation in build test package clean upload deploy publish smoke; do
        run /bin/bash "${repository_root}/${operation}.sh" --help
        [ "$status" -eq 0 ]
        [[ "$output" == *"Usage:"* ]]
    done
}

@test "wrapper resolves repository when called from another directory" {
    cd "$BATS_TEST_TMPDIR"
    run /bin/bash "${repository_root}/build.sh" --help
    [ "$status" -eq 0 ]
}

@test "planned Markdown source cannot report a successful product build" {
    run /bin/bash "${repository_root}/build.sh" --extension markdown
    [ "$status" -ne 0 ]
    [[ "$output" == *"planned"* ]]
}

@test "remote operations reject unconfigured Google access" {
    run /bin/bash "${repository_root}/upload.sh" --extension markdown --environment dev
    [ "$status" -ne 0 ]
    [[ "$output" == *"REMOTE_UNCONFIGURED"* ]]
}

@test "unknown input fails before doing work" {
    run /bin/bash "${repository_root}/build.sh" --unknown
    [ "$status" -ne 0 ]
}
