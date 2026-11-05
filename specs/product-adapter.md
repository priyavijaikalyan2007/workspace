<!--
SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
SPDX-FileCopyrightText: 2026 Outcrop Inc
SPDX-License-Identifier: GPL-3.0-or-later
Repository: workspace
File GUID: d1623fc0-a860-4263-accb-47d895e513eb
Created: 2026
-->

<!-- AGENT: Local product adapter contract, verification, and remaining host gates. -->

# Local product adapter

The local adapter connects registered Apps Script extensions to build, test, and development package commands.
[Issue #4](https://github.com/priyavijaikalyan2007/workspace/issues/4) owns this work.
Markdown remains planned. Its automatic-rendering requirement still needs the host proof in [the product specification](markdown-extension.md).
Synthetic extension tests establish local adapter behavior. They do not establish a working Markdown add-on.

## Design and interfaces

No pattern required - simple functions suffice.
The CLI delegates processing to functions. Google operations and product behavior remain outside this adapter.
Browser assets are optional. The adapter does not require a sidebar or select a source-editing design.

The adapter uses these files and interfaces:

- product-inputs.ts defines ProductInputs: name, canonical directory, version, callbacks, and browser selection.
- product-config.ts exports loadProduct(root, name), which returns validated ProductInputs.
- product-build.ts exports buildProduct(root, product, info), which returns a generated output directory.
- product-validation.ts exports validateProduct(root, product), which runs isolated product checks.
- product-operation.ts exports productOperation(root, options), which connects local selection to validation, identity, and output.
- runner.ts selects explicit extensions or all registry entries whose state is ready.
- package.ts validates runtime files and records their SHA-256 hashes in an immutable local package.

The tests are product-fixture.ts, products.test.ts, product-validation.test.ts, product-operation.test.ts, and product-native.test.ts.
Existing argument and dispatch tests also verify the new routing and rejected selections.

## Source contract

Keep each extension under its configured src/extensions/googleworkspace/NAME directory.
Keep its registry state planned until actual product source and its checks exist.
The ready registry state permits local operations. It does not indicate host or release readiness.

The extension package.json supplies its own stable major.minor.patch version and private=true.
The package also supplies this workspaceExtension object:

```json
{
    "schemaVersion": 1,
    "callbacks": ["onOpen", "getInfo"],
    "browser": false
}
```

Callbacks must have unique names that start with a lowercase letter and contain only letters and digits.
JavaScript keywords, private callback names, and more than 64 callbacks are rejected.
Each callback must be a named, synchronous function exported directly from docs/server.ts.
Default exports and declarations without implementations do not meet this contract.
Helpers can remain separate modules. Only listed functions receive global wrappers.

Every extension supplies these inputs:

- docs/server.ts
- docs/appsscript.json, which selects the V8 runtime
- docs/tsconfig.server.json
- vitest.config.ts and tests under test/

An extension that selects browser=true also supplies these inputs:

- docs/client.ts
- docs/Index.html
- docs/style.css
- docs/tsconfig.client.json, whose compilerOptions.types is an empty list

Index.html must contain exactly one `<!-- STYLE -->` slot and one `<!-- SCRIPT -->` slot.
The adapter inserts compiled browser code and CSS at these slots. Closing script tags in code receive HTML-safe escapes.
The adapter rejects stylesheet text that closes the generated style element.
This packaging step does not sanitize document content or establish compatibility with Google's HTML sandbox.

Product runtime imports must remain in that extension's docs/ or shared/ TypeScript source.
Tests, declaration files, sibling extensions, and Node packages cannot enter the runtime bundle through those imports.
Dependencies or assets loaded by runtime code still need review before integration.
Third-party module bundling, SCSS compilation, multiple HTML surfaces, and component CDN integration are outside this initial adapter.
The existing CDN and dependency rules remain applicable when product UI enters scope.

## Commands and output

For an implemented extension, use the root commands:

```sh
./build.sh --extension NAME
./test.sh --extension NAME
./package.sh --extension NAME
```

Build compiles the selected product. Test runs shared validation and separate product validation.
Package completes both validation layers before it builds and assembles the product package.
Default build, test, and package selections process all ready extensions. Planned entries remain reported as planned.
If no extension is ready, the default package command fails.
The clean command applies to owned output roots and rejects an extension selection.

Server compilation uses strict TypeScript, Apps Script types, and the ES2020 library without browser types.
Browser compilation uses strict TypeScript and the ES2020 and DOM libraries without automatic server types.
Product lint uses the root ESLint rules. Each product runs Vitest separately from tooling.
The product coverage gate includes docs/**/*.ts and shared/**/*.ts, including untested source.
The gate requires 90% lines, statements, and functions, plus 80% branches.
The command fails when no tests exist.

Product vitest.config.ts supplies test discovery and test-only build definitions.
Source can declare __BUILD_INFO__ for compile-time identity replacement. Tests must supply their own synthetic value.
Keep tests independent from Google authorization and private document content.

Builds create fresh build/NAME-SUFFIX directories to prevent stale runtime files from entering a later build.
The apps-script directory contains Code.gs and appsscript.json. Browser-enabled builds also contain Index.html.
A sibling build-info.json records the identity embedded in the bundles.
The identity uses the extension package version, actual Git commit, source dirty state, and effective build number.
An explicit --version overrides the package version. BUILD_NUMBER retains its existing precedence over registry defaults.

Development packages enter dist/NAME-VERSION and cannot replace an existing package.
Their manifest records schemaVersion=1, extension=NAME, environment=dev, and file hashes.
Fixture packages retain their distinct fixture marker.
Production and remote operations remain blocked by their existing release gates.

Rerun the selected build during native development. Incremental product build watching remains future work under issue #4.
Use npm exec vitest -- --config PATH --root PATH for an extension's native test watch workflow.
A later automatic document update is product behavior. It is separate from local test or build watching.

## Test-first evidence

Before implementation, the adapter suites failed because the product modules did not exist.
The existing baseline passed 176 tests at 95.86% line coverage.
Later tests exposed a default-export callback error, a browser compiler argument error, and an unsupported clean selection.
The corresponding fixes passed the focused suites. The final TypeScript suite passed 218 tests at 96.42% tooling line coverage.
Full fixture packaging also passed seven shell checks, 213 retained Python tests, lint, profile validation, and isolated fixture types.
The complete synthetic-product package command passed from a disposable checkout whose path contains spaces.
All three runtime and identity hashes matched. The packaged global callback returned the exact embedded identity.
Real native checks verify both server-only and browser-enabled synthetic source from paths containing spaces.
Negative checks reject browser APIs in server source and reject untested product source below its own coverage gate.

## Remaining gates

Markdown still needs supported automatic document interaction, source recovery, and agreed feature acceptance criteria under issue #3.
No product implementation or ready registry entry was introduced by this adapter work.
Google authorization, document mutation, cursor behavior, undo, collaboration, and interface lifecycle require host evidence under issue #11.
Incremental product builds and hosted Ubuntu verification remain under issue #4.
Production identity, About, and release integration remain under issue #9.

## References

- [esbuild output formats and global names](https://esbuild.github.io/api/#global-name)
- [Google Apps Script V8 runtime](https://developers.google.com/apps-script/guides/v8-runtime)
- [Vitest command line and coverage options](https://vitest.dev/guide/cli.html)
