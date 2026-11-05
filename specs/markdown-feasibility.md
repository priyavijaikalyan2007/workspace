<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: e55d8a03-4e3a-4679-98d5-88cddaed944b
Created: 2026
-->

<!-- AGENT: Automatic rendering assessment, native host observations, and the decision needed before a prototype. -->

# Automatic rendering feasibility

## Finding: 5 November 2026

No reviewed route meets all current constraints: automatic updates, no required persistent interface, Apps Script, and billing disabled.
This is a finding about the selected design and reviewed APIs. It is not proof that all possible Google Docs integrations are impossible.
The unresolved question is activation after arbitrary document text edits. Content insertion itself has supported routes.
No evidence here justifies a blanket claim that Google Docs cannot embed custom content.
[Issue #3](https://github.com/priyavijaikalyan2007/workspace/issues/3) owns that decision.

The current requirements remain automatic rendering, editable source, ordinary Docs prose, technical blocks, and both math inputs.
A manual Render action does not meet the requirement. A persistent sidebar was not accepted.
No product code, browser-extension component, billing change, or new execution identity was introduced by this assessment.

## Supported API review

| Route | Verified contract | Consequence for this product |
| --- | --- | --- |
| Editor add-on triggers | Docs has open and install events. Edit and change events belong to Sheets. | An add-on cannot use a Docs onEdit callback to react to typed Markdown. |
| Add-on clock trigger | Add-on timers run at most once per hour. | This route does not provide interaction as the user types. |
| HTML-service polling | An open HTML interface can call Apps Script through google.script.run. | A small open window is a candidate for periodic checks. Its rendering behavior still needs a host proof. |
| Drive push notifications | Delivery requires an HTTPS receiver and a watch channel. | This needs a delivery and execution design beyond the current add-on callbacks. |
| Workspace Events API | Drive has a contentChanged event. Subscription setup requires Pub/Sub and a Cloud project with billing enabled. | This documented route conflicts with the explicit unbilled-project requirement. |
| Browser extension | No browser-extension implementation or supported Docs editing contract was established here. | This remains a separate research option, not a proven solution. |

Google documents an Apps Script subscription example for Workspace Events. Apps Script support does not remove the billing prerequisite.
Its documented Pub/Sub push route requires publishing an Apps Script web app when that runtime receives the messages.
The sample Drive content-change payload identifies a file and version. It does not establish caret access or completed Markdown detection.
Neither subscription latency nor safe automatic document replacement was measured in this assessment.

The absence of a Docs edit trigger is documented by Google. No upload or runtime test is needed to prove that documented interface limitation.
A document-formatting API alone does not provide the event that starts formatting.
Cloud project linking also does not add a Docs text-edit trigger.

## Embedded content and editable source

Public integrations confirm that technical content can appear inside a regular Google Doc and reopen for editing.
MathType inserts equation images. Its documentation says the image's alternative-text metadata includes MathML for reopening the equation.
Draw.io inserts diagrams as images and replaces those images when the add-on updates the diagrams.
These are documented vendor contracts. Neither vendor add-on was installed or tested during this assessment.

Google also supports third-party smart chips and preview cards through Google Workspace add-on manifests.
A matching URL can become an inline chip. Hovering over the chip opens a card built from supported widgets and actions.
The @ menu supports forms that create third-party resources and insert their chips into the document.
These host-provided interfaces are real extension mechanisms. They deserve review before any claim about unsupported content embedding.
They do not establish an arbitrary HTML/JavaScript runtime inside a document paragraph.
No public API for that general runtime was identified in this review. This limited finding must not describe all embedded content as impossible.

For this product, image output plus retained source is a supported direction to investigate for diagrams and math.
The source format, storage, accessibility, and recovery behavior still need our own host verification.
Outcrop MarkdownRenderer could prepare visual output in an appropriate browser runtime. Its output still needs a Docs content adapter.
Smart chips are another possible interaction, subject to user acceptance and review of the selected add-on model.
Neither option alone supplies arbitrary Docs keystroke events.

## Delimiter detection proposal

The user proposed checking nearby text when a recognized character, such as a backtick, is entered.
This is a reasonable way to limit scanning when a runtime can observe the relevant editor input and read nearby document text.
The selected Apps Script Editor add-on has no documented Docs key or text-edit callback.
An HTML-service interface receives events in its own interface, not a documented stream of document-editor typing events.
Chrome content scripts can register DOM event listeners in web pages. That makes a browser extension a candidate for this experiment.
It does not prove that the extension can reliably obtain the Docs source range or apply formatting through a supported editing interface.

The narrow experiment must establish three separate capabilities:

1. Observe committed delimiter input in the actual Docs editor, including events from the relevant frame.
2. Read the correct nearby source and cursor range without relying on a guessed text buffer.
3. Apply native formatting while preserving source, cursor behavior, undo, and concurrent document edits.

A keydown event alone is insufficient. The experiment must handle composition, paste, deletion, undo, and fenced blocks spanning multiple input events.
No browser-extension source or permissions were added. That component remains disabled pending an explicit selection.
The user's prior-employer examples are unavailable. Do not request or infer private implementation details from those examples.

## Native Docs baseline

A new private, disposable regular Google Doc was created in the verified publisher testing profile.
Its name is Workspace Markdown feasibility — disposable — 5 November 2026.
The retained test document is https://docs.google.com/document/d/1_pTvhF7saa5RKLlC7cQbbzeM-XKvO_y_Fkfx8jC4MKI/edit?tab=t.0.
No existing user document was edited. No add-on was installed or executed.

Computer Use entered these synthetic paragraphs through native text input:

```text
Inline check: `probe` after.
Bold control: **probe** after.
```

The visible result showed the inline probe in green monospace text, without visible backticks.
The bold control retained its asterisks. Docs displayed a prompt about previewing Markdown formatting.
Tools > Preferences showed Enable Markdown unchecked. Cancel closed Preferences without changing the setting.
The preview prompt was dismissed, and the document reported Saved to Drive.

Find in document returned zero matches for the backtick-delimited probe and two matches for the plain word probe.
The font control reported Roboto Mono after the inline occurrence was selected through Find.
These observations establish a native formatting result in this session. They do not establish a custom add-on callback or source-retention mechanism.
The input method was tool-driven text insertion. Per-keystroke timing and input-method composition were not measured.
Undo, collaboration, source recovery, reload behavior, diagrams, and math remain untested.

Native formatting therefore does not satisfy the complete product proof.
Our add-on still needs a supported activation mechanism and its own verified source-preservation behavior.

## Decision before implementation

Review the delimiter experiment and embedded-content mechanisms with the user before selecting a prototype.
An open-window polling prototype remains one possible route if the user accepts keeping a small modeless dialog open.
A modeless dialog permits document interaction while the dialog remains open. It is a candidate, not a passing host result.
The proposed prototype would make serial, bounded checks through Apps Script and show whether automatic mode is active.
Closing the window would end that polling session. The prototype must measure delay, cursor behavior, source recovery, undo, and stale-update rejection.
This option changes the persistent-interface expectation and needs the user's decision.

If automatic operation must continue without an open window, investigate a browser extension as a separate feasibility task.
That investigation must prove supported content access and writes before changing the product platform or promising success.
The browser-extension profile remains disabled until the user selects that work.
The billing-disabled requirement remains in force for both options.

The full host acceptance cases remain in [markdown-extension.md](markdown-extension.md).
The [local product adapter](product-adapter.md) is ready for implemented source after an interaction route is selected.
No pattern required - this task assesses contracts and records observations. It introduces no implementation interface.

## Sources reviewed

All sources below were reviewed on 5 November 2026.

- [Editor add-on trigger matrix and timer restrictions](https://developers.google.com/workspace/add-ons/concepts/editor-triggers)
- [Simple trigger definitions](https://developers.google.com/apps-script/guides/triggers)
- [Installable triggers and execution identity](https://developers.google.com/apps-script/guides/triggers/installable)
- [HTML-service client/server calls](https://developers.google.com/apps-script/guides/html/communication)
- [Dialogs and sidebars](https://developers.google.com/apps-script/guides/dialogs)
- [HTML-service sandbox](https://developers.google.com/apps-script/guides/html/restrictions)
- [Drive push notifications](https://developers.google.com/workspace/drive/api/guides/push)
- [Drive event types and example payload](https://developers.google.com/workspace/events/guides/events-drive)
- [Workspace subscription prerequisites and Apps Script delivery](https://developers.google.com/workspace/events/guides/create-subscription)
- [Smart chips and supported preview widgets](https://developers.google.com/workspace/add-ons/guides/preview-links-smart-chips)
- [Third-party resource creation through the @ menu](https://developers.google.com/workspace/add-ons/guides/create-insert-resource-smart-chip)
- [MathType image output and MathML metadata](https://docs.wiris.com/en_US/using-mathtype-for-google-workspace/accessibility-in-mathtype-for-google-workspace)
- [Draw.io insertion and updates in Google Docs](https://www.drawio.com/docs/integrations/google/google-docs-diagrams/)
- [Chrome content script capabilities and event listeners](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Native Markdown help](https://support.google.com/docs/answer/12014036?hl=en-GB)
