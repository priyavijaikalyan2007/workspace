// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: 592167d8-e193-4268-9fe2-9b101f13aa26
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Display fixture identity without product UI or a Google connection.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

declare const __BUILD_INFO__: Readonly<{ version: string }>;

const output = document.querySelector('#version');
if (output)
{
    output.textContent = __BUILD_INFO__.version;
}
