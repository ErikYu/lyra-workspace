# Lyra Sheet Revival Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring this canvas-based spreadsheet project back to a maintainable, testable state and then close the biggest gaps between the current prototype and a usable spreadsheet component.

**Architecture:** Keep `libs/lyra-sheet-core` as the framework-agnostic spreadsheet engine, with Angular and React as thin wrappers. First add regression tests around the existing core behavior, then fix wrapper lifecycle/data-flow issues, then implement high-impact spreadsheet features such as clipboard and real autofill. Avoid broad rewrites until the current behavior is pinned by tests.

**Tech Stack:** Nx 13, Yarn, TypeScript 4.6, Angular 13, React 18, Jest, Cypress, RxJS, tsyringe, Canvas.

---

## Current Assessment

### What Is Already Worth Keeping

- `libs/lyra-sheet-core/src/lib/types/types.model.ts` has a useful sparse data model for sheets, rows, columns, rich text cells, cell styles, merges, and selected sheets.
- `libs/lyra-sheet-core/src/lib/services/sheet.service.ts` contains the most important engine behavior: selection, styling, borders, merge handling, row/column resize, row/column insertion and deletion, cell insertion and deletion, and rich text write-back.
- `libs/lyra-sheet-core/src/lib/services/merges.service.ts` contains meaningful merge-range movement and intersection behavior.
- `libs/lyra-sheet-core/src/lib/services/canvas.service.ts`, `view-range.service.ts`, `scrolling.service.ts`, and `render-proxy.service.ts` provide the basic canvas rendering and viewport infrastructure.
- `libs/lyra-sheet-angular/src/lib/lyra-sheet.component.ts` is the stronger wrapper because it has per-instance dependency injection, `dataChange`, resize handling, and working multi-instance demo coverage in `apps/demo-ng`.

### What Is Simplified Or Risky

- `libs/lyra-sheet-core/src/lib/services/formula-render.service.ts` is a lightweight formula evaluator, not a full spreadsheet calculation engine. It lacks dependency tracking, recalculation order, circular reference detection, cross-sheet references, and broad function coverage.
- `libs/lyra-sheet-core/src/lib/services/history.service.ts` uses full JSON snapshots. This is acceptable for early recovery work, but it will become expensive for large sheets.
- `libs/lyra-sheet-react/src/lib/container-context.ts` creates one module-level child container, so multiple React sheets can share core state unexpectedly.
- `libs/lyra-sheet-react/src/lib/LyraSheet.tsx` initializes config, data, and history during render, which can reload state repeatedly.
- `libs/lyra-sheet-core/src/lib/services/autofill.service.ts` only tracks a drag rectangle. It does not write filled cells, infer series, or adjust formulas.

### What Is Missing

- Clipboard support: copy, cut, paste, multi-cell paste, TSV/HTML interop.
- Real autofill behavior: copy fill, numeric series, date series, formula reference adjustment.
- Spreadsheet data features: sort, filter, data validation, conditional formatting, freeze panes, find/replace.
- Production-grade formula engine: dependency graph, incremental recalculation, circular reference handling, cross-sheet references, more functions.
- Meaningful test coverage: core unit tests, wrapper behavior tests, and spreadsheet-focused E2E tests.

---

## File Structure Plan

- Modify: `package.json` to add explicit scripts for all important verification commands.
- Modify: `README.md` to document project purpose, architecture, local setup, commands, and known limitations.
- Modify: `nx.json` to remove or rotate the checked-in Nx Cloud token if this repository is shared or public.
- Test: `libs/lyra-sheet-core/src/lib/services/sheet.service.spec.ts` for core row/column/cell operations.
- Test: `libs/lyra-sheet-core/src/lib/services/merges.service.spec.ts` for merge movement and intersection invariants.
- Test: `libs/lyra-sheet-core/src/lib/services/formula-render.service.spec.ts` for current formula behavior and edge cases.
- Test: `libs/lyra-sheet-core/src/lib/services/history.service.spec.ts` for undo/redo snapshot behavior.
- Modify: `libs/lyra-sheet-react/src/lib/container-context.ts` to make containers instance-scoped.
- Modify: `libs/lyra-sheet-react/src/lib/LyraSheet.tsx` to move initialization into effects and expose a data change callback.
- Test: `libs/lyra-sheet-react/src/lib/LyraSheet.spec.tsx` for rendering, initialization, and data callback behavior.
- Create: `libs/lyra-sheet-core/src/lib/services/clipboard.service.ts` for copy/paste serialization and application.
- Test: `libs/lyra-sheet-core/src/lib/services/clipboard.service.spec.ts` for TSV parsing, rectangular paste, and style-preserving copy.
- Modify: `libs/lyra-sheet-core/src/lib/services/autofill.service.ts` to write filled data instead of only tracking geometry.
- Test: `libs/lyra-sheet-core/src/lib/services/autofill.service.spec.ts` for copy-fill and simple numeric series.
- Modify: `apps/demo-ng-e2e/src/integration/app.spec.ts` and `apps/demo-react-e2e/src/integration/app.spec.ts` to cover real spreadsheet interactions.

---

## Task 1: Establish A Reliable Baseline

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Review: `nx.json`

- [x] **Step 1: Record the expected local environment**

  Update `README.md` with this project summary and setup section:

  ```markdown
  # Lyra Workspace

  Lyra Sheet is a web-canvas-based spreadsheet component. The framework-agnostic spreadsheet engine lives in `libs/lyra-sheet-core`, while `libs/lyra-sheet-angular` and `libs/lyra-sheet-react` provide Angular and React integrations.

  ## Recommended Environment

  This project uses Nx 13, Angular 13, React 18, and TypeScript 4.6. Prefer Node 16 when reviving or maintaining the project because Angular 13 and ngcc may fail on newer Node versions.

  ## Development

  - Install dependencies: `yarn install`
  - Start Angular demo: `yarn start-ng`
  - Start React demo: `yarn start-react`
  - Build core library: `yarn build-core-lib`
  - Build Angular library: `yarn build-ng-lib`
  - Build React library: `yarn build-react-lib`
  - Run tests: `yarn test`
  - Run lint checks: `yarn lint`
  ```

- [x] **Step 2: Add explicit verification scripts**

  In `package.json`, keep existing scripts and add:

  ```json
  {
    "lint-react-lib": "nx lint lyra-sheet-react",
    "lint-demo-ng": "nx lint demo-ng",
    "lint-demo-react": "nx lint demo-react",
    "test-core": "nx test lyra-sheet-core",
    "test-ng-lib": "nx test lyra-sheet-angular",
    "test-react-lib": "nx test lyra-sheet-react",
    "e2e-ng": "nx e2e demo-ng-e2e",
    "e2e-react": "nx e2e demo-react-e2e",
    "verify": "yarn lint && yarn lint-react-lib && yarn test-core && yarn test-ng-lib && yarn test-react-lib"
  }
  ```

- [x] **Step 3: Run baseline commands**

  Run:

  ```bash
  yarn install
  yarn build-core-lib
  yarn build-ng-lib
  yarn build-react-lib
  yarn verify
  ```

  Expected: The commands either pass or produce a concrete failure list to record before code changes.

  Baseline result recorded on this pass:

  - `yarn install` passed.
  - `yarn build-core-lib` passed, with an Nx Cloud 502 warning.
  - `yarn build-ng-lib` passed, with Nx Cloud 502 plus existing Browserslist/PostCSS warnings.
  - `yarn build-react-lib` passed, with Nx Cloud 502 plus existing Browserslist/Rollup warnings.
  - `yarn verify` failed at `yarn test-core` because `libs/lyra-sheet-core/src/lib/services/line-wrap.service.spec.ts` contains no executable tests. `yarn lint-react-lib` completed with existing warnings and no errors before that failure.

- [x] **Step 4: Decide what to do with the Nx Cloud token**

  Inspect `nx.json`. If this repository is public, shared, or no longer uses this Nx Cloud workspace, remove the checked-in `tasksRunnerOptions.default.options.accessToken` or rotate it in Nx Cloud.

  Decision for this pass: token was reviewed and left unchanged because project ownership/publication status is not confirmed. Treat rotation/removal as an owner follow-up before publishing or sharing this repository.

- [x] **Step 5: Commit baseline docs and scripts**

  ```bash
  git add README.md package.json nx.json
  git commit -m "chore: document revival workflow"
  ```

---

## Task 2: Add Core Regression Tests Before Refactoring

**Files:**
- Create: `libs/lyra-sheet-core/src/lib/services/sheet.service.spec.ts`
- Create: `libs/lyra-sheet-core/src/lib/services/merges.service.spec.ts`
- Create: `libs/lyra-sheet-core/src/lib/services/formula-render.service.spec.ts`
- Create: `libs/lyra-sheet-core/src/lib/services/history.service.spec.ts`

- [x] **Step 1: Test formulas as they work today**

  Create `libs/lyra-sheet-core/src/lib/services/formula-render.service.spec.ts` with tests for:

  ```ts
  describe('FormulaRenderService', () => {
    it('evaluates arithmetic expressions', () => {
      expect(service.convPlainText('=1+2*3')).toBe('7');
    });

    it('evaluates SUM over literal arguments', () => {
      expect(service.convPlainText('=SUM(1,2,3)')).toBe(6);
    });

    it('returns #Error through conv when evaluation throws', () => {
      expect(service.conv([[{ text: '=UNKNOWN(1)', style: {} }]])[0][0].text).toBe('#Error');
    });
  });
  ```

  Build the service with a real `DataService` instance or a minimal test double that provides `selectedSheet.getCellPlainText`.

- [x] **Step 2: Test merge invariants**

  Create `libs/lyra-sheet-core/src/lib/services/merges.service.spec.ts` with tests that prove:

  ```ts
  it('moves merges down when rows are inserted above the merge', () => {
    const merges = new MergesService([{ sri: 2, eri: 3, sci: 1, eci: 2 }], cellRangeFactory);
    merges.insertRows(1, 2);
    expect(merges.merges).toEqual([{ sri: 4, eri: 5, sci: 1, eci: 2 }]);
  });

  it('detects a merge hit for a cell inside the range', () => {
    const hit = merges.getHitMerge(2, 1);
    expect(hit).toEqual({ sri: 2, eri: 3, sci: 1, eci: 2 });
  });
  ```

- [x] **Step 3: Test sheet structure operations**

  Create `libs/lyra-sheet-core/src/lib/services/sheet.service.spec.ts` with focused tests for:

  ```ts
  it('applies rich text to a cell', () => {
    sheet.applyRichTextToCell(1, 1, [[{ text: 'hello' }]]);
    expect(sheet.getCellPlainText(1, 1)).toBe('hello');
  });

  it('clears selected cell text without removing cell style', () => {
    sheet.applyRichTextToCell(1, 1, [[{ text: 'hello' }]]);
    sheet.applyBgColorTo({ sri: 1, eri: 1, sci: 1, eci: 1 }, '#fff');
    sheet.clearText();
    expect(sheet.getCellPlainText(1, 1)).toBe('');
    expect(sheet.getCell(1, 1).style?.bgColor).toBe('#fff');
  });
  ```

- [x] **Step 4: Test undo and redo behavior**

  Create `libs/lyra-sheet-core/src/lib/services/history.service.spec.ts` with tests that prove:

  ```ts
  it('restores the previous data snapshot on undo', () => {
    history.init(initialData);
    history.stacked(nextData);
    history.undo();
    expect(dataService.snapshot()).toEqual(initialData);
  });

  it('restores the next data snapshot on redo', () => {
    history.init(initialData);
    history.stacked(nextData);
    history.undo();
    history.redo();
    expect(dataService.snapshot()).toEqual(nextData);
  });
  ```

- [x] **Step 5: Run core tests**

  Run:

  ```bash
  yarn test-core
  ```

  Expected: All new core tests pass.

  Result recorded on this pass: first run failed because core specs needed `reflect-metadata`. After adding the polyfill import, the formula unknown-function test exposed a real bug where `=UNKNOWN(1)` evaluated to `1`; `FormulaRenderService.evalSuffixExpr` now throws when evaluation leaves extra stack values, so `conv()` returns `#Error`. Final `yarn test-core` result: 5 test suites passed, 12 tests passed. The previously empty `line-wrap.service.spec.ts` was restored with a real percent-format test so the core Jest suite no longer fails with "must contain at least one test".

- [x] **Step 6: Commit core tests**

  ```bash
  git add libs/lyra-sheet-core/src/lib/services/*.spec.ts
  git commit -m "test: cover core spreadsheet services"
  ```

---

## Task 3: Fix React Wrapper Lifecycle And Data Flow

**Files:**
- Modify: `libs/lyra-sheet-react/src/lib/container-context.ts`
- Modify: `libs/lyra-sheet-react/src/lib/LyraSheet.tsx`
- Modify: `libs/lyra-sheet-react/src/lib/LyraSheet.spec.tsx`

- [x] **Step 1: Replace the module-level shared container with an instance provider**

  Refactor `container-context.ts` so each `LyraSheet` instance owns a child container:

  ```ts
  import React, { createContext, useContext } from 'react';
  import { createCore } from '@lyra-sheet/core';
  import { container, DependencyContainer } from 'tsyringe';
  import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';

  createCore();

  const LyraSheetContainerContext = createContext<DependencyContainer | null>(null);

  export const LyraSheetContainerProvider = LyraSheetContainerContext.Provider;

  export function createLyraSheetContainer(): DependencyContainer {
    return container.createChildContainer();
  }

  export function useLyraSheetCore<T>(injectionToken: InjectionToken<T>): T {
    const scopedContainer = useContext(LyraSheetContainerContext);
    if (!scopedContainer) {
      throw new Error('useLyraSheetCore must be used inside LyraSheetContainerProvider');
    }
    return scopedContainer.resolve(injectionToken);
  }
  ```

- [x] **Step 2: Move initialization out of render**

  In `LyraSheet.tsx`, change props and lifecycle:

  ```ts
  export interface LyraSheetReactProps {
    data: Data;
    config: DatasheetConfig;
    onDataChange?: (data: Data) => void;
  }
  ```

  Use `useMemo` to create one container per component instance and `useLayoutEffect` or `useEffect` to call `setConfig`, `loadData`, `historyService.init`, and `viewRangeService.init`.

- [x] **Step 3: Subscribe to data changes**

  In `LyraSheet.tsx`, subscribe to `dataService.dataChanged$` and call `onDataChange` when present. Return an unsubscribe cleanup from the effect.

- [x] **Step 4: Preserve existing UI composition**

  Keep this rendered structure:

  ```tsx
  <div className="lyra-sheet" ref={rootRef}>
    <LyraSheetToolbar />
    <LyraSheetFormulaBar />
    <LyraSheetEditor />
  </div>
  ```

  Wrap it in `LyraSheetContainerProvider` with the instance container.

- [x] **Step 5: Add React tests**

  Update `libs/lyra-sheet-react/src/lib/LyraSheet.spec.tsx` to render with minimal `data` and `config`. Assert that rendering does not throw and that two rendered instances do not share the same container state.

- [x] **Step 6: Run React tests and lint**

  Run:

  ```bash
  yarn test-react-lib
  yarn lint-react-lib
  ```

  Expected: Both pass.

  Result recorded on this pass: the first `yarn test-react-lib` run failed as expected because `createLyraSheetContainer` and `onDataChange` were not implemented. After the wrapper fix, `yarn test-react-lib` passed with 1 suite and 3 tests. `yarn lint-react-lib` exited 0 with 34 existing warnings. `yarn build-react-lib` also passed, with existing Browserslist/Rollup/Nx Cloud warnings.

- [x] **Step 7: Commit React wrapper fix**

  ```bash
  git add libs/lyra-sheet-react/src/lib/container-context.ts libs/lyra-sheet-react/src/lib/LyraSheet.tsx libs/lyra-sheet-react/src/lib/LyraSheet.spec.tsx
  git commit -m "fix: isolate react sheet instances"
  ```

---

## Task 4: Implement Clipboard Support

**Files:**
- Create: `libs/lyra-sheet-core/src/lib/services/clipboard.service.ts`
- Modify: `libs/lyra-sheet-core/src/lib/services/index.ts`
- Modify: `libs/lyra-sheet-core/src/lib/services/keyboard-event.service.ts`
- Test: `libs/lyra-sheet-core/src/lib/services/clipboard.service.spec.ts`

- [x] **Step 1: Define clipboard service responsibilities**

  `ClipboardService` should support:

  - Serializing the current selected range to TSV for system clipboard copy.
  - Parsing pasted TSV into a rectangular matrix.
  - Applying the matrix starting at the active selected cell.
  - Recording paste changes through `HistoryService`.

- [x] **Step 2: Write TSV parsing tests**

  Create `clipboard.service.spec.ts` with:

  ```ts
  it('parses TSV into a rectangular matrix', () => {
    expect(service.parseTsv('a\tb\nc\td')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
  ```

- [x] **Step 3: Write paste application tests**

  Add:

  ```ts
  it('pastes a TSV matrix starting at the active cell', () => {
    service.pasteTsv('a\tb\nc\td');
    expect(sheet.getCellPlainText(1, 1)).toBe('a');
    expect(sheet.getCellPlainText(1, 2)).toBe('b');
    expect(sheet.getCellPlainText(2, 1)).toBe('c');
    expect(sheet.getCellPlainText(2, 2)).toBe('d');
  });
  ```

- [x] **Step 4: Implement `parseTsv`**

  Add a pure method:

  ```ts
  parseTsv(text: string): string[][] {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map((row) => row.split('\t'));
  }
  ```

- [x] **Step 5: Implement `pasteTsv`**

  Use `DataService.selectedSheet`, the last selector, and `SheetService.applyRichTextToCell` to write each pasted cell as `[[{ text: value }]]`.

- [x] **Step 6: Wire keyboard paste**

  In `KeyboardEventService`, intercept paste events only when the rich text editor is not actively editing. Read `event.clipboardData?.getData('text/plain')`, call `ClipboardService.pasteTsv`, prevent default, and request render.

- [x] **Step 7: Run tests**

  ```bash
  yarn test-core
  ```

  Expected: Clipboard tests and prior core tests pass.

  Result recorded on this pass: the first `yarn test-core` run failed as expected because `ClipboardService` did not exist. After implementation, `yarn test-core` passed with 6 suites and 14 tests. `yarn lint-core` exited 0 with 11 existing warnings, and `yarn build-core-lib` passed with the existing Nx Cloud warning.

- [x] **Step 8: Commit clipboard support**

  ```bash
  git add libs/lyra-sheet-core/src/lib/services/clipboard.service.ts libs/lyra-sheet-core/src/lib/services/index.ts libs/lyra-sheet-core/src/lib/services/keyboard-event.service.ts libs/lyra-sheet-core/src/lib/services/clipboard.service.spec.ts
  git commit -m "feat: add spreadsheet clipboard paste"
  ```

---

## Task 5: Turn Autofill From Geometry Into Behavior

**Files:**
- Modify: `libs/lyra-sheet-core/src/lib/services/autofill.service.ts`
- Test: `libs/lyra-sheet-core/src/lib/services/autofill.service.spec.ts`

- [ ] **Step 1: Define first supported autofill scope**

  Support only these cases first:

  - Single source cell copied into the target range.
  - Single numeric source cell extended as a constant.
  - Two numeric source cells extended as a simple arithmetic series.

- [ ] **Step 2: Test copy-fill**

  Create `autofill.service.spec.ts` with:

  ```ts
  it('copies a single source cell into the autofill range', () => {
    sheet.applyRichTextToCell(1, 1, [[{ text: 'hello' }]]);
    service.applyAutofill(sourceSelector, { sri: 2, eri: 3, sci: 1, eci: 1 });
    expect(sheet.getCellPlainText(2, 1)).toBe('hello');
    expect(sheet.getCellPlainText(3, 1)).toBe('hello');
  });
  ```

- [ ] **Step 3: Test numeric series**

  Add:

  ```ts
  it('extends a two-cell numeric series downward', () => {
    sheet.applyRichTextToCell(1, 1, [[{ text: '1' }]]);
    sheet.applyRichTextToCell(2, 1, [[{ text: '3' }]]);
    service.applyAutofill(sourceSelector, { sri: 3, eri: 5, sci: 1, eci: 1 });
    expect(sheet.getCellPlainText(3, 1)).toBe('5');
    expect(sheet.getCellPlainText(4, 1)).toBe('7');
    expect(sheet.getCellPlainText(5, 1)).toBe('9');
  });
  ```

- [ ] **Step 4: Implement `applyAutofill`**

  Add a public method that receives the source selector and target range, computes the fill values, writes cells through `SheetService.applyRichTextToCell`, records history, and requests render.

- [ ] **Step 5: Call `applyAutofill` from drag completion**

  In `hideAutofill`, replace the debug `console.log` calls with a call to `applyAutofill` when `this.rect` is not null.

- [ ] **Step 6: Run tests**

  ```bash
  yarn test-core
  ```

  Expected: Autofill tests and prior core tests pass.

- [ ] **Step 7: Commit autofill behavior**

  ```bash
  git add libs/lyra-sheet-core/src/lib/services/autofill.service.ts libs/lyra-sheet-core/src/lib/services/autofill.service.spec.ts
  git commit -m "feat: apply basic autofill values"
  ```

---

## Task 6: Add Product-Level E2E Coverage

**Files:**
- Modify: `apps/demo-ng-e2e/src/integration/app.spec.ts`
- Modify: `apps/demo-react-e2e/src/integration/app.spec.ts`

- [ ] **Step 1: Replace welcome-page checks with spreadsheet checks**

  Update both E2E specs to visit the demo and assert that `.lyra-sheet` exists.

- [ ] **Step 2: Add cell editing coverage**

  In both specs, double-click the first visible cell, type a value, press Enter, and assert the value appears in the sheet.

- [ ] **Step 3: Add toolbar smoke coverage**

  Select a cell, click bold, type text, and verify the rendered rich text still appears after committing edit.

- [ ] **Step 4: Add Angular persistence coverage**

  In `apps/demo-ng-e2e/src/integration/app.spec.ts`, edit a cell, reload the page, and assert the value is restored from localStorage.

- [ ] **Step 5: Run E2E tests**

  ```bash
  yarn e2e-ng
  yarn e2e-react
  ```

  Expected: Both E2E suites pass locally.

- [ ] **Step 6: Commit E2E coverage**

  ```bash
  git add apps/demo-ng-e2e/src/integration/app.spec.ts apps/demo-react-e2e/src/integration/app.spec.ts
  git commit -m "test: cover spreadsheet demo interactions"
  ```

---

## Task 7: Decide The Formula Strategy

**Files:**
- Modify: `README.md`
- Modify: `libs/lyra-sheet-core/src/lib/services/formula-render.service.ts`
- Test: `libs/lyra-sheet-core/src/lib/services/formula-render.service.spec.ts`

- [ ] **Step 1: Document the current formula scope**

  Add a `Formula Support` section to `README.md`:

  ```markdown
  ## Formula Support

  The current formula engine is lightweight. It supports basic arithmetic, same-sheet A1 references, ranges such as `A1:B2`, and the functions `SUM`, `AVERAGE`, `MAX`, `MIN`, `IF`, `AND`, and `OR`.

  It does not yet support dependency graphs, incremental recalculation, circular reference detection, cross-sheet references, named ranges, or Excel-compatible function coverage.
  ```

- [ ] **Step 2: Add explicit tests for unsupported behavior**

  Add tests that lock current behavior for circular references and unknown functions. The expected result should be `#Error` through `conv`.

- [ ] **Step 3: Choose one route**

  Choose one of:

  - Keep lightweight formulas and document them as a non-goal for now.
  - Replace `FormulaRenderService` internals with a dependency-graph-based engine.
  - Integrate an existing formula engine library after evaluating bundle size and license.

- [ ] **Step 4: Commit formula scope decision**

  ```bash
  git add README.md libs/lyra-sheet-core/src/lib/services/formula-render.service.ts libs/lyra-sheet-core/src/lib/services/formula-render.service.spec.ts
  git commit -m "docs: clarify formula engine scope"
  ```

---

## Final Verification

- [ ] Run:

  ```bash
  yarn verify
  yarn build-core-lib
  yarn build-ng-lib
  yarn build-react-lib
  yarn e2e-ng
  yarn e2e-react
  ```

- [ ] Manually open:

  ```bash
  yarn start-ng
  yarn start-react
  ```

- [ ] Verify manually:

  - A cell can be edited and committed.
  - Undo and redo work.
  - A merged cell still renders and selects correctly.
  - Clipboard paste works for a 2x2 TSV block.
  - Autofill works for copy-fill and a numeric series.
  - Two React `LyraSheet` instances do not share state.

---

## Execution Recommendation

Use this order:

1. Task 1 to make the project runnable and understandable.
2. Task 2 before any meaningful behavior change.
3. Task 3 because React has a real multi-instance state bug.
4. Task 4 and Task 5 because clipboard and autofill are high-impact spreadsheet basics.
5. Task 6 to protect actual user workflows.
6. Task 7 after the project has tests, because formula strategy has the highest rewrite risk.
