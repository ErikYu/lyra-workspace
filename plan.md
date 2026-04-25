# Lyra Sheet Vanilla UI Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Lyra Sheet toward a framework-agnostic vanilla DOM/Canvas UI layer, so Angular and React become thin wrappers instead of two duplicated UI implementations.

**Architecture:** Keep `libs/lyra-sheet-core` as the spreadsheet engine for data, selection, merge, history, formula, clipboard, autofill, and controller logic. Add a new `libs/lyra-sheet-vanilla` package that owns DOM creation, event binding, toolbar/editor/formula bar rendering, lifecycle, and CSS. Then rewrite React and Angular wrappers to mount/destroy the vanilla sheet instance rather than maintaining duplicate UI component trees.

**Tech Stack:** Nx 13, TypeScript 4.6, vanilla DOM APIs, Canvas, contenteditable, RxJS, tsyringe, Jest unit tests. No E2E requirement for this pass.

---

## Design Summary

### Why Vanilla UI

The spreadsheet UI is closer to a complex DOM/Canvas widget than normal business UI. The expensive parts are canvas rendering, selection masks, keyboard/mouse events, scrollbars, rich text editing, toolbar commands, context menus, and lifecycle cleanup. React or Angular do not add much value inside those internals, but they do double the maintenance cost when every component exists twice.

### Target Shape

```text
libs/lyra-sheet-core
  framework-agnostic spreadsheet engine

libs/lyra-sheet-vanilla
  framework-agnostic DOM/Canvas UI implementation

libs/lyra-sheet-react
  thin React wrapper around lyra-sheet-vanilla

libs/lyra-sheet-angular
  thin Angular wrapper around lyra-sheet-vanilla, or deprecated compatibility wrapper
```

### Public Vanilla API

The vanilla layer should expose one main class and a small typed API:

```ts
import { Data, DatasheetConfig } from '@lyra-sheet/core';

export interface LyraSheetVanillaOptions {
  data: Data;
  config: DatasheetConfig;
  onDataChange?: (data: Data) => void;
}

export class LyraSheetVanilla {
  constructor(options: LyraSheetVanillaOptions);
  mount(host: HTMLElement): void;
  update(options: Partial<LyraSheetVanillaOptions>): void;
  destroy(): void;
}
```

### Migration Rule

Do not delete Angular or React at the start. The existing Angular UI is the primary feature baseline because it is the most complete implementation today. The vanilla implementation must preserve Angular's shipped behavior before any wrapper is replaced or any duplicated UI is deleted. React can still migrate first to prove the wrapper pattern, but React migration must not redefine the product surface down to React's current smaller feature set.

### Feature Preservation Rule

No existing UI capability may be dropped silently. If a feature exists in Angular today, the migration must either:

- implement it in `lyra-sheet-vanilla`,
- explicitly defer it in this plan with a named follow-up task and keep Angular as the source of truth until then,
- or intentionally remove it only after a separate product decision.

The default is preservation. "Simplify during migration" is not acceptable unless the removed behavior is named and approved.

### Angular Parity Baseline

The vanilla UI must preserve these Angular-layer capabilities before Angular is replaced:

- Root component accepts `data` and `config`.
- Root component emits data changes through `dataChange`-equivalent callback.
- Window/container resize updates sheet size through `ConfigService`.
- Toolbar includes undo, redo, percent, currency, decimal add/reduce, format, font family, font size, bold, italic, strike, underline, font color, background color, border, merge, horizontal align, vertical align, text wrap, and formula controls.
- Formula bar mounts to `FormulaBarController` and updates displayed label/value.
- Editor mounts canvas, mask, row resizer, column resizer, vertical scrollbar, horizontal scrollbar, context menu, tabs, and rich text input.
- Rich text input supports contenteditable editing and commits back through existing core services.
- Selection UI, autofill handle, resize handles, and scrollbars remain visible and interactive.
- Context menu keeps existing insert/delete row/column/cell actions.
- Tabs preserve sheet list rendering, selection, add sheet, and rename behavior.
- Existing CSS classes remain stable unless wrappers and demos are updated in the same task.

### Testing Rule

Use unit tests only. Do not add or repair Cypress E2E as part of this plan. Test vanilla DOM behavior with Jest and JSDOM where possible, and test core behavior with existing core unit tests.

---

## Task 1: Add The Vanilla Library Skeleton

**Files:**
- Create: `libs/lyra-sheet-vanilla/project.json`
- Create: `libs/lyra-sheet-vanilla/package.json`
- Create: `libs/lyra-sheet-vanilla/tsconfig.json`
- Create: `libs/lyra-sheet-vanilla/tsconfig.lib.json`
- Create: `libs/lyra-sheet-vanilla/tsconfig.spec.json`
- Create: `libs/lyra-sheet-vanilla/jest.config.js`
- Create: `libs/lyra-sheet-vanilla/.eslintrc.json`
- Create: `libs/lyra-sheet-vanilla/src/index.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.spec.ts`
- Modify: `angular.json`
- Modify: `tsconfig.base.json`
- Modify: `package.json`

- [x] **Step 1: Add project configuration**

  Create `libs/lyra-sheet-vanilla/project.json`:

  ```json
  {
    "root": "libs/lyra-sheet-vanilla",
    "sourceRoot": "libs/lyra-sheet-vanilla/src",
    "projectType": "library",
    "targets": {
      "lint": {
        "executor": "@nrwl/linter:eslint",
        "outputs": ["{options.outputFile}"],
        "options": {
          "lintFilePatterns": ["libs/lyra-sheet-vanilla/**/*.ts"]
        }
      },
      "test": {
        "executor": "@nrwl/jest:jest",
        "outputs": ["coverage/libs/lyra-sheet-vanilla"],
        "options": {
          "jestConfig": "libs/lyra-sheet-vanilla/jest.config.js",
          "passWithNoTests": false
        }
      },
      "build": {
        "executor": "@nrwl/js:tsc",
        "outputs": ["{options.outputPath}"],
        "options": {
          "outputPath": "dist/libs/lyra-sheet-vanilla",
          "tsConfig": "libs/lyra-sheet-vanilla/tsconfig.lib.json",
          "packageJson": "libs/lyra-sheet-vanilla/package.json",
          "main": "libs/lyra-sheet-vanilla/src/index.ts"
        }
      }
    },
    "tags": []
  }
  ```

- [x] **Step 2: Add package metadata**

  Create `libs/lyra-sheet-vanilla/package.json`:

  ```json
  {
    "name": "@lyra-sheet/vanilla",
    "version": "0.0.1",
    "dependencies": {
      "tslib": "^2.0.0"
    },
    "peerDependencies": {
      "@lyra-sheet/core": "0.0.1"
    }
  }
  ```

- [x] **Step 3: Add TypeScript configs**

  Create `libs/lyra-sheet-vanilla/tsconfig.json`:

  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "types": []
    },
    "include": [],
    "files": [],
    "references": [
      { "path": "./tsconfig.lib.json" },
      { "path": "./tsconfig.spec.json" }
    ]
  }
  ```

  Create `libs/lyra-sheet-vanilla/tsconfig.lib.json`:

  ```json
  {
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "outDir": "../../dist/out-tsc",
      "declaration": true,
      "types": []
    },
    "include": ["src/**/*.ts"],
    "exclude": ["**/*.spec.ts"]
  }
  ```

  Create `libs/lyra-sheet-vanilla/tsconfig.spec.json`:

  ```json
  {
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "outDir": "../../dist/out-tsc",
      "module": "commonjs",
      "types": ["jest", "node"]
    },
    "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
  }
  ```

- [x] **Step 4: Add Jest config**

  Create `libs/lyra-sheet-vanilla/jest.config.js`:

  ```js
  module.exports = {
    displayName: 'lyra-sheet-vanilla',
    preset: '../../jest.preset.js',
    globals: {
      'ts-jest': {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    },
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    coverageDirectory: '../../coverage/libs/lyra-sheet-vanilla',
  };
  ```

- [x] **Step 5: Export the public API**

  Create `libs/lyra-sheet-vanilla/src/index.ts`:

  ```ts
  export * from './lib/LyraSheetVanilla';
  ```

- [x] **Step 6: Add a minimal failing mount test**

  Create `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.spec.ts`:

  ```ts
  import 'reflect-metadata';
  import { LyraSheetVanilla } from './LyraSheetVanilla';
  import { Data, DatasheetConfig } from '@lyra-sheet/core';

  const data: Data = {
    sheets: [
      {
        name: 'Sheet1',
        selected: true,
        data: {
          merges: [],
          rows: {},
          rowCount: 10,
          cols: {},
          colCount: 5,
        },
      },
    ],
  };

  const config: DatasheetConfig = {
    width: () => 800,
    height: () => 400,
    row: { height: 25, count: 10, indexHeight: 25 },
    col: { width: 100, count: 5, indexWidth: 60 },
  };

  describe('LyraSheetVanilla', () => {
    it('mounts the spreadsheet shell into a host element', () => {
      const host = document.createElement('div');
      const sheet = new LyraSheetVanilla({ data, config });

      sheet.mount(host);

      expect(host.querySelector('.lyra-sheet')).toBeTruthy();
      expect(host.querySelector('.lyra-sheet-toolbar')).toBeTruthy();
      expect(host.querySelector('.lyra-sheet-formula-bar')).toBeTruthy();
      expect(host.querySelector('.lyra-sheet-editor')).toBeTruthy();
      expect(host.querySelector('canvas')).toBeTruthy();
    });
  });
  ```

- [x] **Step 7: Run the test and verify it fails**

  Run:

  ```bash
  yarn nx test lyra-sheet-vanilla
  ```

  Expected: fail because `LyraSheetVanilla` does not exist or does not mount DOM yet.

  Result recorded on this pass: the first run failed because Nx did not yet discover `lyra-sheet-vanilla`; this repo registers projects through `angular.json`, so the project was added there. The second run failed for the intended TDD reason: `Cannot find module './LyraSheetVanilla'`.

- [x] **Step 8: Implement the minimal class**

  Create `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`:

  ```ts
  import { Data, DatasheetConfig } from '@lyra-sheet/core';

  export interface LyraSheetVanillaOptions {
    data: Data;
    config: DatasheetConfig;
    onDataChange?: (data: Data) => void;
  }

  export class LyraSheetVanilla {
    private rootEl: HTMLDivElement | null = null;

    constructor(private options: LyraSheetVanillaOptions) {}

    mount(host: HTMLElement): void {
      this.destroy();
      const root = document.createElement('div');
      root.className = 'lyra-sheet';
      root.appendChild(this.createToolbar());
      root.appendChild(this.createFormulaBar());
      root.appendChild(this.createEditor());
      host.appendChild(root);
      this.rootEl = root;
    }

    update(options: Partial<LyraSheetVanillaOptions>): void {
      this.options = { ...this.options, ...options };
    }

    destroy(): void {
      this.rootEl?.remove();
      this.rootEl = null;
    }

    private createToolbar(): HTMLElement {
      const el = document.createElement('div');
      el.className = 'lyra-sheet-toolbar';
      return el;
    }

    private createFormulaBar(): HTMLElement {
      const el = document.createElement('div');
      el.className = 'lyra-sheet-formula-bar';
      return el;
    }

    private createEditor(): HTMLElement {
      const el = document.createElement('div');
      el.className = 'lyra-sheet-editor';
      el.appendChild(document.createElement('canvas'));
      return el;
    }
  }
  ```

- [x] **Step 9: Register path and scripts**

  Add to `tsconfig.base.json` paths:

  ```json
  "@lyra-sheet/vanilla": ["libs/lyra-sheet-vanilla/src/index.ts"]
  ```

  Add scripts to `package.json`:

  ```json
  "build-vanilla-lib": "nx build lyra-sheet-vanilla --verbose",
  "lint-vanilla-lib": "nx lint lyra-sheet-vanilla",
  "test-vanilla-lib": "nx test lyra-sheet-vanilla"
  ```

- [x] **Step 10: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn lint-vanilla-lib
  yarn build-vanilla-lib
  ```

  Expected: all pass.

  Result recorded on this pass: `yarn test-vanilla-lib && yarn lint-vanilla-lib && yarn build-vanilla-lib` exited 0. The test suite passed with 1 suite and 1 test. Lint passed after adding a package-level `.eslintrc.json` because the root config ignores all files unless packages opt in with `ignorePatterns: ["!**/*"]`. Build passed. Nx Cloud reported remote 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla tsconfig.base.json package.json plan.md
  git commit -m "feat: add vanilla sheet shell"
  ```

---

## Task 2: Move Core Container Wiring Into Vanilla

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/createVanillaContainer.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/createVanillaContainer.spec.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.spec.ts`
- Modify: `libs/lyra-sheet-vanilla/src/index.ts`
- Modify: `libs/lyra-sheet-vanilla/tsconfig.json`

- [x] **Step 1: Write a failing container isolation test**

  Create `libs/lyra-sheet-vanilla/src/lib/createVanillaContainer.spec.ts`:

  ```ts
  import 'reflect-metadata';
  import { DataService } from '@lyra-sheet/core';
  import { createVanillaContainer } from './createVanillaContainer';

  describe('createVanillaContainer', () => {
    it('creates isolated DataService instances', () => {
      const first = createVanillaContainer().resolve(DataService);
      const second = createVanillaContainer().resolve(DataService);

      expect(first).not.toBe(second);
    });
  });
  ```

- [x] **Step 2: Implement container creation**

  Create `libs/lyra-sheet-vanilla/src/lib/createVanillaContainer.ts`:

  ```ts
  import { createCore } from '@lyra-sheet/core';
  import { container, DependencyContainer } from 'tsyringe';

  createCore();

  export function createVanillaContainer(): DependencyContainer {
    return container.createChildContainer();
  }
  ```

- [x] **Step 3: Wire options into core services on mount**

  In `LyraSheetVanilla`, create a container in the constructor and resolve:

  ```ts
  ConfigService;
  DataService;
  ElementRefService;
  HistoryService;
  ViewRangeService;
  ```

  During `mount(host)`, call:

  ```ts
  configService.setConfig(options.config);
  dataService.loadData(cloneDeep(options.data));
  historyService.init(cloneDeep(options.data));
  elementRefService.initRoot(root);
  elementRefService.initCanvas(canvas);
  viewRangeService.init();
  ```

- [x] **Step 4: Subscribe to data changes**

  Add a subscription to `dataService.dataChanged$` and call `options.onDataChange?.(data)`. Store the subscription and unsubscribe in `destroy()`.

- [x] **Step 5: Test data change callback**

  Extend `LyraSheetVanilla.spec.ts`:

  ```ts
  it('notifies consumers when core data changes', () => {
    const host = document.createElement('div');
    const onDataChange = jest.fn();
    const sheet = new LyraSheetVanilla({ data, config, onDataChange });

    sheet.mount(host);
    sheet.dataService.notifyDataChange();

    expect(onDataChange).toHaveBeenCalledWith(data);
  });
  ```

  If exposing `dataService` publicly feels wrong, add a package-private `getDataServiceForTesting()` method and mark it as test-only in a comment.

  Result recorded on this pass: the first `yarn test-vanilla-lib` run failed as expected because `createVanillaContainer` and `getDataServiceForTesting()` did not exist. Implementation creates a tsyringe child container, resolves core services, initializes config/data/history/root/canvas/view range on mount, and subscribes to `dataChanged$`. `tsconfig.json` also now mirrors core decorator/esModuleInterop settings so vanilla tests can compile core's `dayjs` import.

- [x] **Step 6: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-vanilla-lib
  ```

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 2 suites and 3 tests. `yarn lint-vanilla-lib` passed. `yarn build-vanilla-lib` passed. Nx Cloud reported remote 502/timeout warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla plan.md
  git commit -m "feat: wire vanilla sheet core container"
  ```

---

## Task 3: Build Vanilla DOM Components

**Files:**
- Create: `libs/lyra-sheet-vanilla/src/lib/parity/angularParity.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/parity/angularParity.spec.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/createElement.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderToolbar.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderFormulaBar.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderEditor.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderRichTextInput.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderSelectorLayer.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderScrollbars.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/dom/renderTabs.ts`
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/dom/*.spec.ts`

- [x] **Step 1: Create the Angular parity checklist as executable data**

  Create `libs/lyra-sheet-vanilla/src/lib/parity/angularParity.ts`:

  ```ts
  export const angularParitySelectors = [
    '.lyra-sheet',
    '.lyra-sheet-toolbar',
    '.lyra-sheet-formula-bar',
    '.lyra-sheet-editor',
    '.lyra-sheet-rich-text-input',
    '.lyra-sheet-rich-text-input-area',
    'canvas',
    '.lyra-sheet-editor-mask',
    '.lyra-sheet-resizer-row',
    '.lyra-sheet-resizer-col',
    '.lyra-sheet-scrollbar-v',
    '.lyra-sheet-scrollbar-h',
    '.lyra-sheet-contextmenu',
    '.lyra-sheet-tabs',
  ] as const;

  export const angularParityToolbarActions = [
    'undo',
    'redo',
    'percent',
    'currency',
    'decimal-reduce',
    'decimal-add',
    'format',
    'font-family',
    'font-size',
    'bold',
    'italic',
    'strike',
    'underline',
    'font-color',
    'background-color',
    'border',
    'merge',
    'align',
    'valign',
    'text-wrap',
    'formula',
  ] as const;
  ```

- [x] **Step 2: Test the parity checklist is enforced**

  Create `libs/lyra-sheet-vanilla/src/lib/parity/angularParity.spec.ts`:

  ```ts
  import {
    angularParitySelectors,
    angularParityToolbarActions,
  } from './angularParity';

  describe('angular parity baseline', () => {
    it('documents the DOM selectors vanilla must preserve', () => {
      expect(angularParitySelectors).toContain('.lyra-sheet-toolbar');
      expect(angularParitySelectors).toContain('.lyra-sheet-contextmenu');
      expect(angularParitySelectors).toContain('.lyra-sheet-tabs');
    });

    it('documents the toolbar actions vanilla must preserve', () => {
      expect(angularParityToolbarActions).toContain('bold');
      expect(angularParityToolbarActions).toContain('merge');
      expect(angularParityToolbarActions).toContain('formula');
    });
  });
  ```

- [x] **Step 3: Add a small DOM helper**

  Create `createElement.ts`:

  ```ts
  export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className?: string,
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tagName);
    if (className) {
      el.className = className;
    }
    return el;
  }
  ```

- [x] **Step 4: Write toolbar render test**

  Test that `renderToolbar()` creates `.lyra-sheet-toolbar` and one DOM button/item for every entry in `angularParityToolbarActions`. Each item should expose a stable attribute:

  ```html
  <button data-lyra-action="bold"></button>
  ```

- [x] **Step 5: Implement toolbar DOM**

  `renderToolbar(container)` should return an element and attach click handlers to the relevant core controllers resolved from the container. Do not omit Angular toolbar actions just because React did not fully expose them.

- [x] **Step 6: Write editor render test**

  Test that `renderEditor()` creates every selector listed in `angularParitySelectors` that belongs to the editor area:

  ```text
  .lyra-sheet-editor
  .lyra-sheet-rich-text-input
  .lyra-sheet-rich-text-input-area[contenteditable="true"]
  canvas
  .lyra-sheet-editor-mask
  .lyra-sheet-resizer-row
  .lyra-sheet-resizer-col
  .lyra-sheet-scrollbar-v
  .lyra-sheet-scrollbar-h
  .lyra-sheet-contextmenu
  .lyra-sheet-tabs
  ```

- [x] **Step 7: Implement editor DOM**

  Split editor rendering into small functions. Keep event/controller wiring minimal in this task; DOM structure parity is enough. Do not skip context menu, tabs, scrollbars, or resizers.

- [x] **Step 8: Wire ElementRefService**

  After creating editor DOM, initialize:

  ```ts
  elementRefService.initMask(maskEl);
  elementRefService.initCanvas(canvasEl);
  elementRefService.initRowResizer(rowResizerEl);
  elementRefService.initColResizer(colResizerEl);
  ```

  Result recorded on this pass: the first `yarn test-vanilla-lib` run failed as expected because `angularParity`, `renderToolbar`, and `renderEditor` modules did not exist. Implementation added executable Angular parity data, toolbar buttons for every parity action, editor DOM for canvas/mask/resizers/scrollbars/context menu/tabs/rich text input, and ElementRefService wiring for mask/canvas/row/column resizers.

- [x] **Step 9: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn lint-vanilla-lib
  ```

  Result recorded on this pass: `yarn test-vanilla-lib` passed with 5 suites and 7 tests. `yarn lint-vanilla-lib` passed. `yarn build-vanilla-lib` also passed as an extra type/build check. Nx Cloud reported remote 502 warnings, but local targets succeeded.

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla plan.md
  git commit -m "feat: render vanilla sheet dom"
  ```

---

## Task 4: Port Controller Mounting And Lifecycle Cleanup

**Files:**
- Modify: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.ts`
- Create: `libs/lyra-sheet-vanilla/src/lib/lifecycle/SubscriptionBag.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/lifecycle/SubscriptionBag.spec.ts`
- Test: `libs/lyra-sheet-vanilla/src/lib/LyraSheetVanilla.spec.ts`

- [ ] **Step 1: Add subscription cleanup utility**

  Create a tiny `SubscriptionBag` that accepts RxJS subscriptions and DOM cleanup callbacks:

  ```ts
  export class SubscriptionBag {
    private cleanups: Array<() => void> = [];

    add(cleanup: { unsubscribe: () => void } | (() => void)): void {
      this.cleanups.push(
        typeof cleanup === 'function' ? cleanup : () => cleanup.unsubscribe(),
      );
    }

    cleanup(): void {
      for (const cleanup of this.cleanups.splice(0)) {
        cleanup();
      }
    }
  }
  ```

- [ ] **Step 2: Test cleanup**

  Verify cleanup callbacks run once and subscriptions are unsubscribed.

- [ ] **Step 3: Mount existing controllers**

  In `LyraSheetVanilla.mount`, after DOM creation and element refs:

  ```ts
  editorController.mountDom(editorEl);
  richTextInputController.mount(richTextHostEl, richTextEditableEl);
  formulaBarController.mount(formulaTextareaEl);
  editorController.onInit();
  editorController.afterViewInit();
  ```

- [ ] **Step 4: Initialize mouse and keyboard pipelines through existing editor controller**

  Prefer existing `EditorController.onInit()` instead of manually duplicating `MouseEventService` and `KeyboardEventService` wiring. If a controller assumes Angular/React timing, adapt the vanilla mount order rather than forking behavior.

- [ ] **Step 5: Ensure destroy removes DOM and subscriptions**

  `destroy()` must remove root DOM, unsubscribe data change subscriptions, and clear lifecycle callbacks. It does not need to reset core state; a new `LyraSheetVanilla` instance gets a new child container.

- [ ] **Step 6: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn build-vanilla-lib
  ```

  Commit:

  ```bash
  git add libs/lyra-sheet-vanilla plan.md
  git commit -m "feat: mount vanilla sheet controllers"
  ```

---

## Task 5: Migrate React Wrapper To Vanilla

**Files:**
- Modify: `libs/lyra-sheet-react/src/lib/LyraSheet.tsx`
- Modify: `libs/lyra-sheet-react/src/lib/LyraSheet.spec.tsx`
- Modify: `libs/lyra-sheet-react/project.json`
- Modify: `libs/lyra-sheet-react/package.json`
- Optionally deprecate: `libs/lyra-sheet-react/src/lib/components/**`

- [ ] **Step 1: Write failing React wrapper test**

  Update `LyraSheet.spec.tsx` so it expects the wrapper to render only a host element and instantiate `LyraSheetVanilla`. Mock `@lyra-sheet/vanilla`:

  ```ts
  const mount = jest.fn();
  const update = jest.fn();
  const destroy = jest.fn();

  jest.mock('@lyra-sheet/vanilla', () => ({
    LyraSheetVanilla: jest.fn().mockImplementation(() => ({ mount, update, destroy })),
  }));
  ```

  Test:

  ```ts
  it('mounts vanilla sheet on a host element', () => {
    render(<LyraSheet data={data} config={config} />);
    expect(mount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
  ```

- [ ] **Step 2: Replace React internals**

  Implement `LyraSheet.tsx` as a thin wrapper:

  ```tsx
  export function LyraSheet({ data, config, onDataChange }: LyraSheetReactProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<LyraSheetVanilla | null>(null);

    useLayoutEffect(() => {
      if (!hostRef.current) return;
      sheetRef.current = new LyraSheetVanilla({ data, config, onDataChange });
      sheetRef.current.mount(hostRef.current);
      return () => {
        sheetRef.current?.destroy();
        sheetRef.current = null;
      };
    }, []);

    useLayoutEffect(() => {
      sheetRef.current?.update({ data, config, onDataChange });
    }, [data, config, onDataChange]);

    return <div ref={hostRef} />;
  }
  ```

- [ ] **Step 3: Remove direct core/container usage from React wrapper**

  `libs/lyra-sheet-react/src/lib/container-context.ts` should no longer be used by the public wrapper. Keep it temporarily only if old internal components remain during migration, but do not export it as part of the new path.

- [ ] **Step 4: Update build dependencies**

  Ensure React library build includes `@lyra-sheet/vanilla` as a dependency or external according to the current Rollup setup.

- [ ] **Step 5: Verify and commit**

  Run:

  ```bash
  yarn test-react-lib
  yarn build-react-lib
  ```

  Commit:

  ```bash
  git add libs/lyra-sheet-react libs/lyra-sheet-vanilla plan.md
  git commit -m "refactor: wrap vanilla sheet in react"
  ```

---

## Task 6: Decide Angular Wrapper Strategy

**Files:**
- Modify: `README.md`
- Either modify: `libs/lyra-sheet-angular/src/lib/lyra-sheet.component.ts`
- Or document deprecation: `libs/lyra-sheet-angular/README.md`
- Test: `libs/lyra-sheet-angular/src/lib/lyra-sheet.component.spec.ts` if Angular remains active

- [ ] **Step 1: Reconfirm Angular feature preservation**

  Before choosing an Angular path, compare the current Angular implementation against `angularParitySelectors` and `angularParityToolbarActions`. If the vanilla implementation lacks any Angular capability, Angular must remain legacy-compatible and must not be replaced.

- [ ] **Step 2: Choose one Angular path**

  Choose one:

  - **Active wrapper:** Rewrite Angular `LyraSheetComponent` to instantiate `LyraSheetVanilla` in `ngAfterViewInit`, call `update()` in `ngOnChanges`, and call `destroy()` in `ngOnDestroy`.
  - **Legacy wrapper:** Leave Angular implementation untouched and document that new UI work happens in vanilla + React first.
  - **Deprecation:** Mark Angular package as deprecated in docs, without removing code.

  Recommendation: choose **Legacy wrapper** until vanilla + React satisfy the Angular parity baseline. Angular has more old tests, CDK coupling, and the most complete UI behavior, so migrating it too early risks feature loss.

- [ ] **Step 3: If Active wrapper is chosen, write failing Angular wrapper test**

  Mock `LyraSheetVanilla`, mount the component, and assert `mount()` and `destroy()` are called.

- [ ] **Step 4: If Legacy wrapper is chosen, document the status**

  Add to `libs/lyra-sheet-angular/README.md`:

  ```markdown
  # @lyra-sheet/angular

  Angular support is currently legacy-compatible and remains the feature baseline for UI parity. New UI implementation work should target `@lyra-sheet/vanilla` first, but Angular must not be replaced until the vanilla implementation preserves the Angular toolbar, editor, formula bar, context menu, tabs, resize, scroll, selection, and data-change behavior.
  ```

- [ ] **Step 5: Verify and commit**

  For Legacy wrapper:

  ```bash
  yarn build-ng-lib
  ```

  Commit:

  ```bash
  git add README.md libs/lyra-sheet-angular/README.md plan.md
  git commit -m "docs: define angular wrapper strategy"
  ```

---

## Task 7: Remove Duplicated UI Code After Parity

**Files:**
- Delete or archive: `libs/lyra-sheet-react/src/lib/components/**`
- Delete or archive: React icon imports only used by old components
- Modify: `libs/lyra-sheet-react/src/index.ts`
- Modify: `README.md`

- [ ] **Step 1: Confirm Angular parity checklist**

  Before deleting old React UI components or replacing Angular, verify vanilla/React supports every Angular baseline feature:

  - Sheet shell renders.
  - All Angular toolbar actions exist and dispatch core commands.
  - Formula bar mounts.
  - Canvas mounts.
  - Rich text input opens and commits text.
  - Selection mask renders.
  - Scrollbars mount.
  - Tabs render.
  - Context menu renders and exposes insert/delete actions.
  - Row and column resizers render and remain wired.
  - `onDataChange` fires.
  - Multiple React instances are isolated.

- [ ] **Step 2: Delete old React component tree**

  Remove old duplicated React UI components only after the Angular parity checklist passes. If any feature is missing, keep the old UI path or add the missing vanilla behavior first.

- [ ] **Step 3: Keep wrapper tests**

  React package tests should prove wrapper lifecycle, not duplicate vanilla DOM behavior.

- [ ] **Step 4: Verify and commit**

  Run:

  ```bash
  yarn test-vanilla-lib
  yarn test-react-lib
  yarn build-vanilla-lib
  yarn build-react-lib
  ```

  Commit:

  ```bash
  git add libs/lyra-sheet-react README.md plan.md
  git commit -m "refactor: remove duplicated react sheet ui"
  ```

---

## Final Verification

- [ ] Run unit tests and builds:

  ```bash
  yarn test-core
  yarn test-vanilla-lib
  yarn test-react-lib
  yarn build-core-lib
  yarn build-vanilla-lib
  yarn build-react-lib
  ```

- [ ] Skip Cypress E2E unless explicitly reintroduced later.

- [ ] Manually open demos:

  ```bash
  yarn start-react
  yarn start-ng
  ```

- [ ] Verify manually:

  - React demo renders via vanilla implementation.
  - Angular demo still works and remains the feature baseline until vanilla reaches parity.
  - Editing a cell still works.
  - Clipboard paste still works.
  - Autofill still works for copy-fill and numeric series.
  - Formula errors still render as `#Error`.
  - Vanilla preserves Angular toolbar, formula bar, context menu, tabs, scrollbars, resizers, selection, and data-change behavior before any Angular replacement.

---

## Execution Recommendation

1. Build `lyra-sheet-vanilla` as a new package without deleting existing UI.
2. Move core container and lifecycle ownership into vanilla.
3. Build DOM structure parity in small tested pieces, using Angular as the feature baseline.
4. Mount existing core controllers from vanilla.
5. Migrate React first because its current wrapper is already thinner and was recently improved.
6. Keep Angular as legacy until vanilla + React preserve Angular's implemented UI behavior.
7. Delete duplicated UI only after Angular parity is proven.
