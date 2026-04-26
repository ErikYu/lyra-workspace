# Demo Vanilla Design

## Goal

Build `apps/demo-vanilla` as a no-framework demo for `@lyra-sheet/vanilla`, then grow the vanilla UI in stages until it reaches the current Angular demo's spreadsheet behavior.

## Scope

The first implementation pass must produce a runnable Nx Web app that mounts `LyraSheetVanilla` directly from plain TypeScript. It must not use Angular, React, JSX, Angular templates, or framework component lifecycles.

The longer-term success criteria are Angular parity:

- Render the sheet shell, toolbar, formula bar, editor, canvas, selection mask, rich text input, scrollbars, context menu, resizers, and tabs.
- Support data/config input and `onDataChange` output.
- Preserve core editing flows: select cells, edit content, commit text, render formula output, paste clipboard data, undo/redo, resize rows/columns, scroll, and switch sheets.
- Preserve toolbar capabilities already present in Angular: undo, redo, percent, currency, decimal add/reduce, format, font family, font size, bold, italic, strike, underline, font color, background color, border, merge, align, valign, text wrap, and formula controls.
- Keep Angular as the feature baseline until the vanilla demo proves these behaviors.

## Architecture

`apps/demo-vanilla` is an Nx Web application with `@nrwl/web:webpack`. Its `main.ts` creates demo `Data` and `DatasheetConfig`, constructs `LyraSheetVanilla`, mounts it into a root DOM node, and persists data changes in localStorage like the Angular demo.

`libs/lyra-sheet-vanilla` owns all framework-free UI work. It should expose small DOM renderers and binding helpers rather than a single large file. DOM renderers create stable elements and return references needed by controllers. Binding helpers connect DOM events to existing core services/controllers.

`libs/lyra-sheet-core` remains the spreadsheet engine. Prefer adapting vanilla DOM to the existing core controller/service APIs over duplicating spreadsheet behavior in the vanilla package.

React remains a thin wrapper around vanilla. Angular remains legacy-compatible and is not replaced until the vanilla demo reaches parity.

## Phased Delivery

### Phase 1: Runnable Vanilla Demo

Create `apps/demo-vanilla`, register it in `angular.json`, add package scripts, and mount `LyraSheetVanilla` from plain TypeScript. The demo should build and serve through Nx. This phase proves the vanilla package can be consumed by a no-framework app.

### Phase 2: Core Editing Loop

Make the demo usable for basic spreadsheet work: canvas rendering, cell selection, rich text input, formula bar display/edit path, keyboard handling, paste support, and `onDataChange`. This phase should validate that the mounted controllers work outside Angular/React.

### Phase 3: Toolbar Commands

Replace toolbar placeholder events with real command bindings. Buttons may remain visually simple at first, but each action must call the same core controllers/services that Angular uses.

### Phase 4: Menus, Tabs, Scrollbars, Resizers

Implement context menu actions, tabs add/select/rename, scrollbars, row/column resizers, and visible selection/autofill affordances. Use Angular behavior as the reference.

### Phase 5: Parity Cleanup

Only after the vanilla demo passes the Angular parity checklist should duplicated React UI components be removed or Angular wrapper migration be reconsidered.

## Testing

Use Jest unit tests for vanilla DOM renderers and binding helpers. Tests should drive behavior before production code:

- `demo-vanilla` app smoke test verifies the app root mounts without a framework.
- Vanilla renderer tests verify stable DOM selectors and returned element references.
- Binding tests verify toolbar actions call core controllers.
- Lifecycle tests verify subscriptions and DOM listeners are cleaned up.

Build verification for each phase:

- `yarn test-vanilla-lib`
- `yarn build-vanilla-lib`
- `yarn nx build demo-vanilla`
- Relevant React/Angular builds when wrapper or parity behavior is affected

## Non-Goals

- Do not add Cypress E2E in this pass.
- Do not delete the old React component tree until Angular parity is proven.
- Do not migrate Angular to vanilla until the vanilla demo preserves Angular's shipped UI behavior.
- Do not introduce a new framework or rendering library for the vanilla demo.

## Risks

Some existing core controllers subscribe internally without exposing teardown hooks. The vanilla layer can clean up subscriptions it owns, but controller-level subscriptions may require follow-up core changes if repeated mount/destroy cycles leak listeners.

Toolbar dropdowns and context menu behavior may need small adapter layers because Angular currently provides component state and templates. Keep those adapters in `lyra-sheet-vanilla`, not in demo code.
