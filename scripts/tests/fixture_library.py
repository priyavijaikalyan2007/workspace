#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
# SPDX-FileCopyrightText: 2026 Outcrop Inc
# SPDX-License-Identifier: GPL-3.0-or-later
# Repository: workspace
# File GUID: 1dc59020-aefa-4312-88ba-30c33856cb43
# Created: 2026

# COMPONENT: Instruction-library test fixtures
# PURPOSE: Keep copied-tool tests independent from the consuming project's identity and history.
# RELATES: test_project_initialization.py, instructions/templates/repository/inherited-files.json
# FLOW: Retained library tools -> isolated synthetic source snapshot -> initialization tests.

import hashlib
import json
from pathlib import Path
import shutil
import subprocess


ROOT = Path(__file__).resolve().parents[2]
FIXTURES = Path(__file__).with_name('fixtures')


def source_repository(root: Path) -> None:
    """Create an isolated Git origin for source-library protection tests without network access."""
    root.mkdir(parents=True, exist_ok=True)
    subprocess.run(['git', 'init', '--quiet', str(root)], check=True)
    subprocess.run(['git', '-C', str(root), 'remote', 'add', 'origin',
                    'https://github.com/priyavijaikalyan2007/instructions.git'], check=True)


def write_fixture_records(root: Path) -> None:
    """Provide synthetic history for cleanup tests instead of copying the project's real conversation."""
    records = {'CONVERSATION.md': '# Source library conversation\n', 'CHANGELOG.md': '# Source library changes\n',
               'agentknowledge/history.jsonl': '{"task":"Synthetic library work"}\n'}
    for name, text in records.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)


def register_fixture_fingerprints(root: Path) -> None:
    """Register known synthetic originals only in the disposable fixture's own allowlist."""
    path = root / 'instructions/templates/repository/inherited-files.json'
    known = json.loads(path.read_text())
    names = ['LICENSE', 'PROJECT_PROFILE.md', 'PROJECT.md', 'ADDITIONAL.md', 'AGENTS.md',
             'README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md',
             'CONVERSATION.md', 'CHANGELOG.md', 'agentknowledge/history.jsonl']
    for name in names:
        known.setdefault(name, []).append(hashlib.sha256((root / name).read_bytes()).hexdigest())
    path.write_text(json.dumps(known, indent=4) + '\n')


def inherit_library(root: Path) -> None:
    """Build a disposable instruction-source snapshot from shipped tools, templates, and bounded fixtures."""
    for name in ['instructions', 'scripts']:
        shutil.copytree(ROOT / name, root / name, ignore=shutil.ignore_patterns('__pycache__'))
    for name in ['AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md', 'configure.sh']:
        shutil.copy2(ROOT / name, root / name)
    templates = root / 'instructions/templates/repository'
    for name in ['PROJECT.md', 'ADDITIONAL.md', 'README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md']:
        shutil.copy2(templates / name, root / name)
    shutil.copy2(templates / 'INSTRUCTION_LIBRARY_LICENSE.txt', root / 'LICENSE')
    shutil.copy2(FIXTURES / 'instruction-profile.md', root / 'PROJECT_PROFILE.md')
    write_fixture_records(root)
    register_fixture_fingerprints(root)
