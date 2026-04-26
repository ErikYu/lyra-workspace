# Demo Vanilla Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-framework `apps/demo-vanilla` and grow `@lyra-sheet/vanilla` toward Angular demo parity in demonstrable phases.

**Architecture:** `apps/demo-vanilla` is an Nx Web app with plain TypeScript and DOM APIs. `libs/lyra-sheet-vanilla` owns framework-free DOM rendering, lifecycle, event binding, and controller adapters. `libs/lyra-sheet-core` remains the spreadsheet engine, while React remains a wrapper and Angular remains the parity baseline.

**Tech Stack:** Nx 13, TypeScript 4.6, `@nrwl/web:webpack`, vanilla DOM APIs, Canvas, contenteditable, RxJS, tsyringe, Jest.

---

## Phase 1: Runnable Vanilla Demo

### Task 1: Add `demo-vanilla` App Skeleton

**Files:**
- Create: `apps/demo-vanilla/project.json`
- Create: `apps/demo-vanilla/.babelrc`
- Create: `apps/demo-vanilla/.eslintrc.json`
- Create: `apps/demo-vanilla/tsconfig.json`
- Create: `apps/demo-vanilla/tsconfig.app.json`
- Create: `apps/demo-vanilla/tsconfig.spec.json`
- Create: `apps/demo-vanilla/jest.config.js`
- Create: `apps/demo-vanilla/src/index.html`
- Create: `apps/demo-vanilla/src/main.ts`
- Create: `apps/demo-vanilla/src/polyfills.ts`
- Create: `apps/demo-vanilla/src/styles.scss`
- Create: `apps/demo-vanilla/src/app/createDemoData.ts`
- Test: `apps/demo-vanilla/src/app/createDemoData.spec.ts`
- Modify: `angular.json`
- Modify: `package.json`

- [x] **Step 1: Write failing demo data test**

  Create `apps/demo-vanilla/src/app/createDemoData.spec.ts`:

  ```ts
  import { createDemoConfig, createDemoData } from './createDemoData';

  describe('demo vanilla data', () => {
    it('creates a selected sheet with demo cell data', () => {
      const data = createDemoData();

      expect(data.sheets).toHaveLength(1);
      expect(data.sheets[0].selected).toBe(true);
      expect(data.sheets[0].data.rows[1].cells[1].richText[0][0].text).toBe(
        '123',
      );
    });

    it('creates a viewport-sized config', () => {
      Object.defineProperty(document.documentElement, 'clientWidth', {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        configurable: true,
        value: 600,
      });

      const config = createDemoConfig();

      expect(config.width()).toBe(1000);
      expect(config.height()).toBe(600);
    });
  });
  ```

- [x] **Step 2: Run test and verify red**

  Run:

  ```bash
  yarn nx test demo-vanilla
  ```

  Expected: fail because `demo-vanilla` is not registered or `createDemoData` does not exist.

  Result recorded on this pass: first run failed because Jest/Babel config was not present yet. After adding the app Babel/TS/Jest config and project registration, the test failed for the intended reason: `Cannot find module './createDemoData'`.

- [x] **Step 3: Add Nx app configuration**

  Add `apps/demo-vanilla/project.json` using the same Web executor shape as `apps/demo-react`, but without React webpack config:

  ```json
  {
    "root": "apps/demo-vanilla",
    "sourceRoot": "apps/demo-vanilla/src",
    "projectType": "application",
    "targets": {
      "build": {
        "executor": "@nrwl/web:webpack",
        "outputs": ["{options.outputPath}"],
        "defaultConfiguration": "production",
        "options": {
          "compiler": "babel",
          "outputPath": "dist/apps/demo-vanilla",
          "index": "apps/demo-vanilla/src/index.html",
          "baseHref": "/",
          "main": "apps/demo-vanilla/src/main.ts",
          "polyfills": "apps/demo-vanilla/src/polyfills.ts",
          "tsConfig": "apps/demo-vanilla/tsconfig.app.json",
          "assets": ["apps/demo-vanilla/src/favicon.ico", "apps/demo-vanilla/src/assets"],
          "styles": ["apps/demo-vanilla/src/styles.scss"],
          "scripts": []
        },
        "configurations": {
          "production": {
            "optimization": true,
            "outputHashing": "all",
            "sourceMap": false,
            "namedChunks": false,
            "extractLicenses": true,
            "vendorChunk": false
          }
        }
      },
      "serve": {
        "executor": "@nrwl/web:dev-server",
        "options": {
          "buildTarget": "demo-vanilla:build",
          "hmr": true
        },
        "configurations": {
          "production": {
            "buildTarget": "demo-vanilla:build:production",
            "hmr": false
          }
        }
      },
      "lint": {
        "executor": "@nrwl/linter:eslint",
        "outputs": ["{options.outputFile}"],
        "options": {
          "lintFilePatterns": ["apps/demo-vanilla/**/*.{ts,js}"]
        }
      },
      "test": {
        "executor": "@nrwl/jest:jest",
        "outputs": ["coverage/apps/demo-vanilla"],
        "options": {
          "jestConfig": "apps/demo-vanilla/jest.config.js",
          "passWithNoTests": false
        }
      }
    },
    "tags": []
  }
  ```

- [x] **Step 4: Add TypeScript, Babel, Jest, and lint config**

  Use `apps/demo-react` as the working pattern:

  - `.babelrc` uses `@nrwl/web/babel`.
  - `.eslintrc.json` extends `../../.eslintrc.json` with `ignorePatterns: ["!**/*"]`.
  - `tsconfig.json` extends root config and sets strict Web app compiler options.
  - `tsconfig.app.json` includes `src/**/*.ts`.
  - `tsconfig.spec.json` includes `src/**/*.spec.ts`.
  - `jest.config.js` uses `babel-jest`, `jsdom`, and app coverage directory.

- [x] **Step 5: Register project and scripts**

  Add to `angular.json`:

  ```json
  "demo-vanilla": "apps/demo-vanilla"
  ```

  Add scripts to `package.json`:

  ```json
  "start-vanilla": "nx serve demo-vanilla --port 12140",
  "build-demo-vanilla": "nx build demo-vanilla",
  "test-demo-vanilla": "nx test demo-vanilla",
  "lint-demo-vanilla": "nx lint demo-vanilla"
  ```

- [x] **Step 6: Implement demo data helpers**

  Create `apps/demo-vanilla/src/app/createDemoData.ts`:

  ```ts
  import { Data, DatasheetConfig } from '@lyra-sheet/core';

  const STORAGE_KEY = 'lyra-sheet-demo-vanilla:data';

  export function createDemoData(): Data {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (cache) {
      return JSON.parse(cache) as Data;
    }

    return {
      sheets: [
        {
          name: 'Sheet1',
          data: {
            merges: [],
            rows: {
              1: {
                cells: {
                  1: {
                    richText: [[{ text: '123' }]],
                  },
                },
              },
            },
            rowCount: 100,
            cols: {
              1: {
                width: 95,
              },
            },
            colCount: 30,
          },
          selected: true,
        },
      ],
    };
  }

  export function createDemoConfig(): DatasheetConfig {
    return {
      width: () => document.documentElement.clientWidth,
      height: () => document.documentElement.clientHeight,
      row: { height: 25, count: 100, indexHeight: 25 },
      col: { width: 100, count: 30, indexWidth: 60 },
    };
  }

  export function saveDemoData(data: Data): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  ```

- [x] **Step 7: Implement vanilla app entry**

  Create `apps/demo-vanilla/src/main.ts`:

  ```ts
  import 'reflect-metadata';
  import { LyraSheetVanilla } from '@lyra-sheet/vanilla';
  import { createDemoConfig, createDemoData, saveDemoData } from './app/createDemoData';

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Missing #root element');
  }

  const sheet = new LyraSheetVanilla({
    data: createDemoData(),
    config: createDemoConfig(),
    onDataChange: saveDemoData,
  });

  sheet.mount(root);
  ```

- [x] **Step 8: Add HTML, polyfills, and styles**

  Create:

  - `index.html` with `<div id="root"></div>` and title `DemoVanilla`.
  - `polyfills.ts` importing `core-js/stable`, `regenerator-runtime/runtime`, and `reflect-metadata`.
  - `styles.scss` importing `../../../libs/lyra-sheet-core/src/lib/lyra-sheet` and setting body margin/padding to `0`.

- [x] **Step 9: Verify and commit**

  Run:

  ```bash
  yarn test-demo-vanilla
  yarn lint-demo-vanilla
  yarn build-demo-vanilla
  yarn test-vanilla-lib
  yarn build-vanilla-lib
  ```

  Result recorded on this pass: `yarn test-demo-vanilla` passed with 1 suite and 2 tests. `yarn lint-demo-vanilla` passed. The first `yarn build-demo-vanilla` failed because the assets glob had no tracked file; adding `apps/demo-vanilla/src/assets/.gitkeep` fixed it. Final `yarn build-demo-vanilla`, `yarn test-vanilla-lib`, and `yarn build-vanilla-lib` all exited 0. Nx Cloud reported remote 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add apps/demo-vanilla angular.json package.json docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md
  git commit -m "feat: add vanilla sheet demo app"
  ```

### Task 2: Make Vanilla Resize Like Angular Demo

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.spec.ts`

- [x] **Step 1: Write failing resize lifecycle test**

  Extend `LyraSheetVanilla.spec.ts` to mount with a config that reads document dimensions, dispatch `resize`, and verify root sizing/config resize behavior through DOM-visible dimensions or a test seam.

  Result recorded on this pass: `yarn test-vanilla-lib` failed as expected because `.lyra-sheet` root `style.width` was `""` instead of `"800px"`.

- [x] **Step 2: Implement window resize subscription**

  Match Angular's root component behavior: set root width/height from config and call `ConfigService.resize(root)` on mount and on window resize. Store listener cleanup in `SubscriptionBag`.

- [x] **Step 3: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-vanilla-lib
  yarn build-demo-vanilla
  ```

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 6 suites and 11 tests. `yarn build-vanilla-lib` passed. `yarn build-demo-vanilla` passed. Nx Cloud reported remote 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md
  git commit -m "feat: resize vanilla sheet root"
  ```

---

## Phase 2: Core Editing Loop

### Task 3: Prove Basic Selection And Editing In Vanilla

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderRichTextInput.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderFormulaBar.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Test: focused vanilla DOM/controller tests

- [x] **Step 1: Write failing tests for rich text input and formula bar DOM contracts**

  Tests must assert that the rich text editable and formula bar editable are mounted with the exact element types expected by `RichTextInputController` and `FormulaBarController`, and that input events reach the controllers.

  Result recorded on this pass: after replacing unsupported `jest-dom` matchers with standard `textContent` assertions, `yarn test-vanilla-lib` failed because `RenderedFormulaBar` had no `label` reference and the mounted vanilla sheet produced no `.lyra-sheet-formula-bar-label` text for selected cell `B2`.

- [x] **Step 2: Fix DOM contracts and controller mount order**

  Keep controller behavior in core. Adapt vanilla DOM so the controllers receive equivalent elements to Angular.

  Result recorded on this pass: `renderFormulaBar` now renders Angular-compatible label, divider, fx, and contenteditable input elements. `LyraSheetVanilla` subscribes `FormulaBarController.label$` into the label text and `RichTextInputController.html$` into the editable rich text area.

- [x] **Step 3: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-demo-vanilla
  ```

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 7 suites and 13 tests. `yarn build-demo-vanilla` passed. Nx Cloud reported remote 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md
  git commit -m "feat: support vanilla editing loop"
  ```

---

## Phase 3: Toolbar Commands

### Task 4: Bind Toolbar Buttons To Core Controllers

**Files:**
- Create: `libs/lyra-sheet-vanilla/src/lib/toolbar/bindToolbarActions.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/toolbar/bindToolbarActions.spec.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderToolbar.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`

- [x] **Step 1: Write failing toolbar command tests**

  Use fake controller objects or a container test double to verify button clicks call the expected methods for at least `undo`, `redo`, `percent`, `currency`, `decimal-add`, `decimal-reduce`, `bold`, `italic`, `strike`, `underline`, and `merge`.

  Result recorded on this pass: `yarn test-vanilla-lib` failed as expected because `./bindToolbarActions` did not exist. After adding the helper, one red pass exposed the need for `reflect-metadata` in the new spec.

- [x] **Step 2: Implement command binding helper**

  Resolve existing core controllers from the vanilla container and map stable `data-lyra-action` values to controller methods. Keep dropdown-heavy actions visually present if a complete menu is not implemented in this task, but do not silently mark them as functionally complete.

  Result recorded on this pass: `bindToolbarActions` now maps undo/redo to `HistoryService`, percent/currency to Angular-equivalent selected-sheet format updates, decimal actions to `DecimalController`, text style toggles to font controllers, and merge to `MergeController`. `LyraSheetVanilla` binds the toolbar listener into `SubscriptionBag` cleanup.

- [x] **Step 3: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-demo-vanilla
  ```

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 8 suites and 19 tests. `yarn build-demo-vanilla` passed. The build reported existing Browserslist and bundle-size warnings plus Nx Cloud 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md
  git commit -m "feat: bind vanilla toolbar actions"
  ```

### Task 4.1: Render Toolbar Icons And Labels

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderToolbar.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/dom/renderToolbar.spec.ts`

- [x] **Step 1: Write failing toolbar visual test**

  Result recorded on this pass: `yarn test-vanilla-lib` failed because the vanilla toolbar had no `.lyra-sheet-divider.vertical` elements and no `.lyra-sheet-toolbar-icon` elements.

- [x] **Step 2: Implement visible toolbar items**

  Result recorded on this pass: `renderToolbar` now follows the Angular/React toolbar grouping order, renders seven vertical dividers, assigns `.lyra-sheet-toolbar-item`, keeps stable `data-lyra-action` values, and adds visible SVG/text labels for every toolbar action.

- [x] **Step 3: Verify and commit**

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 8 suites and 22 tests. `yarn build-demo-vanilla` and `yarn build-vanilla-lib` passed. The build reported existing Browserslist, bundle-size, and Nx Cloud 502 warnings, but local targets succeeded.

### Task 4.2: Add Toolbar Dropdown Menus

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderToolbar.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Modify: `libs/lyra-sheet-core/src/lib/lyra-sheet.scss`
- Create: `libs/lyra-sheet-vanilla/src/lib/toolbar/bindToolbarDropdowns.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/dom/renderToolbar.spec.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/toolbar/bindToolbarDropdowns.spec.ts`

- [x] **Step 1: Write failing dropdown render and behavior tests**

  Result recorded on this pass: `yarn test-vanilla-lib` failed because dropdown actions had no `.lyra-sheet-dropdown-menu` DOM, and `./bindToolbarDropdowns` did not exist.

- [x] **Step 2: Render dropdown menus and bind controller actions**

  Result recorded on this pass: dropdown actions now render hidden option menus and `bindToolbarDropdowns` opens one menu at a time, closes on document click, and dispatches option selections to existing core controllers for format, font family, font size, font color, background color, border, align, valign, text wrap, and formula.

- [x] **Step 3: Verify and commit**

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 9 suites and 26 tests. `yarn build-demo-vanilla` and `yarn build-vanilla-lib` passed. The build reported existing Browserslist, bundle-size, and Nx Cloud 502 warnings, but local targets succeeded.

---

## Phase 4: Menus, Tabs, Scrollbars, Resizers

### Task 5: Port Context Menu And Tabs

**Files:**
- Create/modify vanilla context menu and tabs DOM/binding files
- Test: vanilla context menu and tabs tests

- [x] **Step 1: Write failing tests for context menu actions**

  Cover insert/delete row/column/cell actions by asserting UI events call the same core services used by Angular.

  Result recorded on this pass: `yarn test-vanilla-lib` failed because `.lyra-sheet-contextmenu` remained hidden and had no `[data-lyra-context-menu-item]` entries after a mask `contextmenu` event.

- [x] **Step 2: Write failing tests for tabs behavior**

  Cover sheet list rendering, selecting a sheet, adding a sheet, and rename wiring.

  Result recorded on this pass: `yarn test-vanilla-lib` failed because `.lyra-sheet-tabs` rendered no sheet tabs.

- [x] **Step 3: Implement context menu and tabs adapters**

  Keep rendering and binding code in `libs/lyra-sheet-vanilla`, not in `apps/demo-vanilla`.

  Result recorded on this pass: `renderEditor` now returns context menu and tabs refs. `LyraSheetVanilla` mounts `ContextMenuController` and `TabsController`, renders menu streams into DOM action rows, renders sheet tabs from `DataService.sheets`, and wires select/add/rename behaviors to the core `TabsController`.

- [x] **Step 4: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-demo-vanilla
  ```

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 8 suites and 21 tests. `yarn build-demo-vanilla` passed. The build reported existing Browserslist and bundle-size warnings plus Nx Cloud 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md
  git commit -m "feat: add vanilla menu and tabs behavior"
  ```

### Task 5.1: Restore Vanilla Selection Border

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderSelectorLayer.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/dom/renderEditor.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/dom/renderEditor.spec.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.spec.ts`

- [x] **Step 1: Confirm root cause**

  Result recorded on this pass: Angular and React render `.lyra-sheet-selector-container` inside `.lyra-sheet-editor-mask` and update `.lyra-sheet-selector` children from `DataService.selectorChanged$`. Vanilla rendered only an empty mask, so selection state changed in core but no blue border DOM existed.

- [x] **Step 2: Write failing selector layer tests**

  Result recorded on this pass: `yarn test-vanilla-lib` failed because `RenderedEditor` had no `selectorContainer`, and selecting a cell produced no `.lyra-sheet-selector`.

- [x] **Step 3: Render and bind selector layer**

  Result recorded on this pass: `renderSelectorLayer` now creates the selector container, `renderEditor` returns it, and `LyraSheetVanilla` subscribes selector/resizer/scroll/autofill streams to render `.lyra-sheet-selector`, `.lyra-sheet-selector-autofill`, and `.lyra-sheet-autofill` DOM like Angular/React.

- [x] **Step 4: Verify and commit**

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 9 suites and 27 tests. `yarn build-demo-vanilla` and `yarn build-vanilla-lib` passed. The build reported existing Browserslist, bundle-size, and Nx Cloud 502 warnings, but local targets succeeded.

### Task 6: Port Scrollbars And Resizers

**Files:**
- Create/modify vanilla scrollbar and resizer DOM/binding files
- Test: vanilla scrollbar and resizer tests

- [ ] **Step 1: Write failing scrollbar tests**

  Verify horizontal and vertical scrollbar DOM events update scrolling services and trigger render.

- [ ] **Step 2: Write failing resizer tests**

  Verify row and column resizer DOM events use existing core resize services and preserve Angular behavior.

- [ ] **Step 3: Implement bindings**

  Prefer existing `MouseEventService`, `ResizerService`, and `ScrollingService` behavior. Add vanilla adapters only where DOM structure differs from Angular.

- [ ] **Step 4: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-demo-vanilla
  ```

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md
  git commit -m "feat: wire vanilla scrollbars and resizers"
  ```

---

## Phase 5: Parity Check And Cleanup

### Task 7: Run Angular Parity Checklist

**Files:**
- Modify: `plan.md`
- Modify: `docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md`
- Optional modify: `README.md`

- [ ] **Step 1: Verify parity manually**

  Run `yarn start-vanilla` and compare against `yarn start-ng` for:

  - render shell
  - select cells
  - edit and commit text
  - formula bar display/edit
  - paste clipboard data
  - undo/redo
  - toolbar commands
  - context menu actions
  - tabs add/select/rename
  - scrollbars
  - row/column resize
  - data persistence

- [ ] **Step 2: Decide cleanup**

  If checklist passes, plan deletion of duplicated React component tree. If any item fails, record the missing feature and keep old code.

- [ ] **Step 3: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn test-react-lib
  yarn build-demo-vanilla
  yarn build-react-lib
  yarn build-ng-lib
  ```

  Commit:

  ```bash
  git add plan.md docs/superpowers/plans/2026-04-26-demo-vanilla-implementation.md README.md
  git commit -m "docs: record vanilla demo parity status"
  ```
