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
- workspace.config.json: public Cloud project IDs and numbers. Keep environment script IDs null until each dev/prod association is verified.
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
The user later supplied a publisher-only Chrome profile. The account was verified there. See the browser-control handoff below.

The latest clasp registry version remains 3.4.1, so the previous dependency findings are not resolved by a newer release.
Clasp remains absent from the local lockfile. The runtime preflight uses the installed Google Cloud CLI instead.
Local tests cover 176 TypeScript cases with 95.86% line coverage and seven real shell checks.
The full package command retains all profile, Python, compiler, lint, and coverage gates.

A final verification attempt hit Vitest's coverage lock because two runs started concurrently.
Subsequent final validation runs are sequential. The lock failure did not change application or release records.


## Browser-control handoff: 2 November 2026

The user identified the Chrome profile Priyavijai Kalyan (Knobby.IO Testing), open at the Apps Script home page.
Native UI inspection confirmed the publisher account and showed no projects in that account's Apps Script list.
The browser-control connection inventory exposed only the different profile Priya Vijai.

Clicked New project once in the verified publisher profile. Google displayed Creating Project.
The next native observation returned a different Chrome window. A later attempt to select the other window was interrupted by a Chrome state change.
The created project's final state, name, and script ID remain unverified. Do not create another project before inspecting My Projects.
No script ID was guessed or entered in workspace.config.json. No Cloud association, upload, deployment, or publication was verified.

The account-selection blocker is resolved. The remaining blocker is stable browser control of the requested profile.
Asked the user to choose between connecting that profile to browser control, retaining its active window for native control, or completing the steps manually.
After control is available, inspect the existing project first, name it Outcrop Markdown Dev, and link it to Cloud project number 134157199372.
Only after development is verified, create and link production to Cloud project number 468067001295.
Recheck live billing before remote operations and after linking.

Live billing rechecks returned disabled billing and no account links at 10:31:24 UTC for dev and 16:49:38 UTC for prod on 2 November 2026.


## Extension connection selected

The user selected connecting the testing profile to this app's browser-control extension.
The OpenAI browser-extension guide confirms that the extension must be installed and enabled in the selected Chrome profile.
Supported setup is through the desktop app's Settings > Computer Use > Chrome > Install flow.
Source: https://learn.chatgpt.com/docs/chrome-extension.

Computer Use rejected access to the desktop app's own settings for safety reasons.
Browser security policy rejected chrome://extensions/ because only HTTP and HTTPS protocols are permitted.
The policy explicitly prohibits workarounds for that rejected action. No alternate browser surface or local browser configuration was used.
The extension connection remains unverified and requires the user to complete the supported installation flow.
After that connection appears, resume by inspecting the existing Apps Script project list before any new creation.


## User deferral: 3 November 2026

The user completed permission setup but deferred quitting and restarting cmux for screen recording.
Do not restart cmux or attempt further browser work until the user is ready.
Continue independent local repository work. Script identities and linking remain unverified.
When browser control resumes, inspect the existing creation attempt before creating any new project.


## Native browser recovery: 5 November 2026

The user reported that the computer restarted. Native Chrome access now reaches the publisher testing profile and Apps Script.
The browser-tab inventory still reports that its access host is unavailable. Native inspection works despite that separate control failure.
The active profile is Priyavijai Kalyan (Knobby.IO Testing), and the page confirms the publisher account.

My Projects shows one Untitled project, owned by the publisher and last modified on 2 November 2026.
The editor contains only the default myFunction template. No new project was created.
Project Settings confirms script ID `1_s0nZjJ-FrV9QKTsY5YwFqXcmcIeAYZlrZWZYvc7jz0lZBZlSUKPRjOi`.
The project is available at https://script.google.com/home/projects/1_s0nZjJ-FrV9QKTsY5YwFqXcmcIeAYZlrZWZYvc7jz0lZBZlSUKPRjOi/settings.
Its Cloud association still reads Default. The existing script has not been verified against either configured standard Cloud target.
The dev/prod script IDs therefore remain null in workspace.config.json.

No code was changed, uploaded, or executed. No Cloud link, billing setting, authorization grant, deployment, or publication changed.
Before linking the development target, perform the required fresh billing check and verify the intended script and Cloud identities.
The automatic document-interaction proof remains unverified under issue #3.
The local product adapter is implemented in commit b8dc0f2. Incremental builds and remote adapters remain separate work.

The user selected the saved GitHub account priyavijaikalyan2007 for workspace tracking.
Issues #4 and #11 are members of the configured workspace Project and remain In Progress.
The temporary tracking session restores the previous active GitHub account afterward.


## Publication billing prerequisite: 5 November 2026

The current [Marketplace OAuth guide](https://developers.google.com/workspace/marketplace/configure-oauth-consent-screen) lists enabled Cloud billing as a prerequisite.
Verify whether that prerequisite applies to this Apps Script Editor add-on publication route under issue #11.
The repository's billing-disabled requirement remains authoritative. No billing account, service, scope, or execution identity was changed.
Public publication under the unbilled constraint is not established. Local work and host feasibility remain separate from this release gate.
