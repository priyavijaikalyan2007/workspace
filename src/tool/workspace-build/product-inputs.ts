// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: c8bd049c-e913-4fb3-8e63-0b877c342cc6
// Created: 2026
// COMPONENT: Local product adapter
// PURPOSE: Describe validated extension inputs independently from release or host readiness.
// RELATES: specs/product-adapter.md
// FLOW: Validate configured source -> perform local work -> report verified output.

/** Validated inputs for one local Apps Script extension. Browser UI requires explicit selection. */
export interface ProductInputs
{
    name: string;
    directory: string;
    version: string;
    callbacks: string[];
    browser: boolean;
}
