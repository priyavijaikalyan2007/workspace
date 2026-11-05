// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 097c87d8-7a8b-48e0-bc03-ae6344a63955
// Created: 2026
// COMPONENT: Disposable Docs input experiment
// PURPOSE: Define explicit observation and cleanup operations for a temporary probe.
// RELATES: specs/markdown-input-experiment.md
// FLOW: Validate test target -> observe bounded metrics -> remove listeners.

/** Stopping the probe removes listeners while keeping its bounded metric report available. */
interface ProbeApi
{
    signature: string;
    report(): { active: boolean; documents: number; blockedFrames: number; samples: ProbeSample[] };
    stop(): void;
}
