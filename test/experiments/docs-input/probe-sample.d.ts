// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: d687deb1-2167-45dc-8135-8fce4e7a4989
// Created: 2026
// COMPONENT: Disposable Docs input experiment
// PURPOSE: Describe non-content metrics collected from synthetic editor input.
// RELATES: specs/markdown-input-experiment.md
// FLOW: Validate test target -> observe bounded metrics -> remove listeners.

/** Metrics contain no raw document text or clipboard contents. */
interface ProbeSample
{
    event: string;
    key: string;
    inputType: string;
    committedDelimiter: boolean;
    composing: boolean;
    targetTag: string;
    targetLength: number;
    targetHasSentinel: boolean;
    selectionLength: number;
    selectionHasSentinel: boolean;
    targetRangeCount: number;
}
