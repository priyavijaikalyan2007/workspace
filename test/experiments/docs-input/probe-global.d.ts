// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: eee10510-d215-4be9-8c17-590cb98f3aca
// Created: 2026
// COMPONENT: Disposable Docs input experiment
// PURPOSE: Declare the single temporary browser diagnostic name.
// RELATES: specs/markdown-input-experiment.md
// FLOW: Validate test target -> observe bounded metrics -> remove listeners.

/** This probe name exists only in the current page and contains metrics from the fixed test document. */
// eslint-disable-next-line no-var -- Ambient var declares a globalThis property, not a lexical binding.
declare var __outcropDocsProbe: ProbeApi | undefined;
