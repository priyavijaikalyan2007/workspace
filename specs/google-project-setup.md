<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: a31c2e18-d354-4149-a853-728d0c0ec7d4
Created: 2026
-->

<!-- AGENT: Google setup plan, billing boundaries, and live verification evidence for issue #11. -->

# Google project setup

The user authorized new unbilled Google projects and the next setup work.
The saved publisher account matches the configured personal-account model.
No existing Outcrop Markdown projects appeared in the account's project-list check.
Use explicit account and project arguments. Do not change the active gcloud account or default project.

No pattern required: focused target parsing and a bounded billing check suffice.
Google tooling is isolated from local validation and requires no application backend.

## Implementation

- google-target.ts: GoogleTarget and loadGoogleTarget(root, extension, environment), validating registered names, IDs, and dev/prod separation.
- billing.ts: BillingState, requireUnbilled(value, projectId), and checkBilling(target, account), using live Google Cloud CLI output.
- args.ts, runner.ts, preflight.sh: an explicit read-only billing preflight with required extension and environment selections.
- workspace.config.json: public Cloud project IDs and numbers. Keep script IDs null until actual script projects exist.
- Billing tests: disabled/unlinked, enabled, closed-but-linked, missing fields, mismatched identity, timeout/permission failures, and separated environments.
- SETUP.md, PROJECT.md, specs/, CONVERSATION.md, agentknowledge/, CHANGELOG.md: verified state and remaining work.

Create development first without enabling Cloud APIs or linking billing.
Verify billing immediately after creation. Stop further creation or remote operations if billing is enabled, linked, or unverifiable.
Create production only after development billing verification succeeds.
Do not activate paid services or change billing configuration to make a check pass.
The preflight uses a fresh authoritative response on every invocation. Saved facts never authorize a remote operation.
Missing or malformed information blocks the check. Error messages exclude tokens and raw command output.

The Google Cloud projects do not create Apps Script projects or connect them automatically.
Script projects, OAuth consent/client configuration, host verification, and product adapters remain distinct steps.
Clasp remains deferred until its dependency graph is acceptable.
No fixture upload, deployment, or publication is authorized by a successful billing check.

## References

- https://docs.cloud.google.com/sdk/gcloud/reference/projects/create
- https://docs.cloud.google.com/sdk/gcloud/reference/billing/projects/describe
- https://docs.cloud.google.com/billing/docs/reference/rest/v1/ProjectBillingInfo
- https://developers.google.com/workspace/add-ons/how-tos/publish-add-on-overview


## Live evidence: 2 November 2026

Development creation returned ACTIVE with ID outcrop-markdown-dev-8be3bf5 and number 134157199372.
The immediate billing query returned billingEnabled=false and billingAccountName="".
Production creation then returned ACTIVE with ID outcrop-markdown-prod-8be3bf5 and number 468067001295.
Its immediate billing query also returned billingEnabled=false and billingAccountName="".

The actual preflight.sh command repeated both live checks successfully.
The recorded preflight times were 07:04:12 UTC for development and 07:04:25 UTC for production.
Both returned scriptConfigured=false. No fixture was uploaded and no deployment or publication occurred.
No default gcloud account or project setting was changed.

The browser initially used a different Google account. The saved publisher account was available in the account list.
Selecting that account returned Google's file-open error in the multi-account browser session.
Google documents that Apps Script does not support multi-login and recommends a single-account or private session.
A request for a publisher-only session is pending. Do not create script resources under the other account.

The latest clasp registry version remains 3.4.1, so the previous dependency findings are not resolved by a newer release.
Clasp remains absent from the local lockfile. The runtime preflight uses the installed Google Cloud CLI instead.
Local tests cover 176 TypeScript cases with 95.86% line coverage and seven real shell checks.
The full package command retains all profile, Python, compiler, lint, and coverage gates.

A final verification attempt hit Vitest's coverage lock because two runs started concurrently.
Subsequent final validation runs are sequential. The lock failure did not change application or release records.
