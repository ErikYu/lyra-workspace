import {
  AutofillService,
  cloneDeep,
  ConfigService,
  ContextMenuController,
  ContextMenus,
  Data,
  DataService,
  DatasheetConfig,
  EditorController,
  ElementRefService,
  FormulaBarController,
  HistoryService,
  LocatedRect,
  RichTextInputController,
  ResizerService,
  RootController,
  ScrollingService,
  TabsController,
  ViewRangeService,
} from '@lyra-sheet/core';
import { combineLatest } from 'rxjs';
import { DependencyContainer } from 'tsyringe';
import { createVanillaContainer } from './createVanillaContainer';
import { renderEditor, RenderedEditor } from './dom/renderEditor';
import {
  renderFormulaBar,
  RenderedFormulaBar,
} from './dom/renderFormulaBar';
import { renderToolbar } from './dom/renderToolbar';
import { SubscriptionBag } from './lifecycle/SubscriptionBag';
import { bindToolbarActions } from './toolbar/bindToolbarActions';
import { bindToolbarDropdowns } from './toolbar/bindToolbarDropdowns';

export interface LyraSheetVanillaOptions {
  data: Data;
  config: DatasheetConfig;
  onDataChange?: (data: Data) => void;
}

export class LyraSheetVanilla {
  private rootEl: HTMLDivElement | null = null;
  private options: LyraSheetVanillaOptions;
  private readonly container: DependencyContainer;
  private readonly configService: ConfigService;
  private readonly dataService: DataService;
  private readonly elementRefService: ElementRefService;
  private readonly editorController: EditorController;
  private readonly formulaBarController: FormulaBarController;
  private readonly historyService: HistoryService;
  private readonly autofillService: AutofillService;
  private readonly richTextInputController: RichTextInputController;
  private readonly resizerService: ResizerService;
  private readonly rootController: RootController;
  private readonly scrollingService: ScrollingService;
  private readonly contextMenuController: ContextMenuController;
  private readonly tabsController: TabsController;
  private readonly viewRangeService: ViewRangeService;
  private readonly lifecycle = new SubscriptionBag();

  constructor(options: LyraSheetVanillaOptions) {
    this.options = options;
    this.container = createVanillaContainer();
    this.configService = this.container.resolve(ConfigService);
    this.dataService = this.container.resolve(DataService);
    this.elementRefService = this.container.resolve(ElementRefService);
    this.editorController = this.container.resolve(EditorController);
    this.formulaBarController = this.container.resolve(FormulaBarController);
    this.historyService = this.container.resolve(HistoryService);
    this.autofillService = this.container.resolve(AutofillService);
    this.richTextInputController = this.container.resolve(
      RichTextInputController,
    );
    this.resizerService = this.container.resolve(ResizerService);
    this.rootController = this.container.resolve(RootController);
    this.scrollingService = this.container.resolve(ScrollingService);
    this.contextMenuController = this.container.resolve(ContextMenuController);
    this.tabsController = this.container.resolve(TabsController);
    this.viewRangeService = this.container.resolve(ViewRangeService);
  }

  mount(host: HTMLElement): void {
    this.destroy();

    const root = document.createElement('div');
    root.className = 'lyra-sheet';
    const toolbar = renderToolbar(this.container);
    this.lifecycle.add(bindToolbarActions(toolbar, this.container));
    this.lifecycle.add(bindToolbarDropdowns(toolbar, this.container));
    root.appendChild(toolbar);
    const formulaBar = renderFormulaBar();
    root.appendChild(formulaBar.root);
    const editor = renderEditor();
    root.appendChild(editor.root);

    host.appendChild(root);
    this.rootEl = root;
    this.initializeCore(root, formulaBar, editor);
  }

  update(options: Partial<LyraSheetVanillaOptions>): void {
    this.options = { ...this.options, ...options };
  }

  destroy(): void {
    this.lifecycle.cleanup();
    this.rootEl?.remove();
    this.rootEl = null;
  }

  // Test-only access keeps the public API small while letting unit tests drive core events.
  getDataServiceForTesting(): DataService {
    return this.dataService;
  }

  private initializeCore(
    root: HTMLDivElement,
    formulaBar: RenderedFormulaBar,
    editor: RenderedEditor,
  ): void {
    this.configService.setConfig(this.options.config);
    const initialData = cloneDeep(this.options.data);
    this.dataService.loadData(initialData);
    this.historyService.init(cloneDeep(this.options.data));
    this.elementRefService.initRoot(root);
    this.elementRefService.initMask(editor.mask);
    this.elementRefService.initCanvas(editor.canvas);
    this.elementRefService.initRowResizer(editor.rowResizer);
    this.elementRefService.initColResizer(editor.colResizer);
    this.viewRangeService.init();
    this.bindResize(root);
    this.bindSelectorLayer(editor.selectorContainer);
    this.bindTabs(editor.tabs);
    this.mountControllers(root, formulaBar, editor);
    this.lifecycle.add(
      this.dataService.dataChanged$.subscribe((data) =>
        this.options.onDataChange?.(data),
      ),
    );
  }

  private mountControllers(
    root: HTMLDivElement,
    formulaBar: RenderedFormulaBar,
    editor: RenderedEditor,
  ): void {
    this.rootController.mount(root);
    this.formulaBarController.mount(formulaBar.textarea);
    this.lifecycle.add(
      this.formulaBarController.label$.subscribe((label) => {
        formulaBar.label.textContent = label;
      }),
    );
    this.richTextInputController.mount(
      editor.richTextInput.root,
      editor.richTextInput.editable,
    );
    this.lifecycle.add(
      this.richTextInputController.html$.subscribe((html) => {
        editor.richTextInput.editable.innerHTML = html;
      }),
    );
    this.editorController.mountDom(editor.root);
    this.editorController.onInit();
    this.editorController.afterViewInit();
    this.contextMenuController.mount(editor.contextMenu);
    this.contextMenuController.onInit();
    this.bindContextMenu(editor.contextMenu);
  }

  private bindResize(root: HTMLDivElement): void {
    const resize = () => {
      root.style.width = `${this.options.config.width()}px`;
      root.style.height = `${this.options.config.height()}px`;
      this.configService.resize(root);
    };

    resize();
    window.addEventListener('resize', resize);
    this.lifecycle.add(() => window.removeEventListener('resize', resize));
  }

  private bindSelectorLayer(selectorContainer: HTMLElement): void {
    selectorContainer.style.left = `${this.configService.ciw}px`;
    selectorContainer.style.top = `${this.configService.rih}px`;

    this.lifecycle.add(
      combineLatest([
        this.dataService.selectorChanged$,
        this.resizerService.colResizer$,
        this.resizerService.rowResizer$,
        this.scrollingService.scrolled$,
      ]).subscribe(([selectors]) => {
        this.renderSelectorRects(
          selectorContainer,
          selectors.map((selector) =>
            this.viewRangeService.locateRect(selector.range),
          ),
        );
      }),
    );
    this.lifecycle.add(
      this.autofillService.autofillChanged$.subscribe((rect) => {
        this.renderAutofillRect(
          selectorContainer,
          rect ? this.viewRangeService.locateRect(rect) : null,
        );
      }),
    );
  }

  private renderSelectorRects(
    selectorContainer: HTMLElement,
    rects: LocatedRect[],
  ): void {
    selectorContainer
      .querySelectorAll('.lyra-sheet-selector, .lyra-sheet-selector-autofill')
      .forEach((el) => el.remove());

    rects.forEach((rect) => {
      const selector = document.createElement('div');
      selector.className = 'lyra-sheet-selector';
      this.applyRectStyle(selector, rect);
      selectorContainer.appendChild(selector);

      const autofillHandle = document.createElement('div');
      autofillHandle.className = 'lyra-sheet-selector-autofill';
      autofillHandle.style.left = `${rect.left + rect.width - 4}px`;
      autofillHandle.style.top = `${rect.top + rect.height - 4}px`;
      selectorContainer.appendChild(autofillHandle);
    });
  }

  private renderAutofillRect(
    selectorContainer: HTMLElement,
    rect: LocatedRect | null,
  ): void {
    selectorContainer.querySelector('.lyra-sheet-autofill')?.remove();
    if (!rect) {
      return;
    }

    const autofill = document.createElement('div');
    autofill.className = 'lyra-sheet-autofill';
    this.applyRectStyle(autofill, rect);
    selectorContainer.appendChild(autofill);
  }

  private applyRectStyle(el: HTMLElement, rect: LocatedRect): void {
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  }

  private bindTabs(tabsRoot: HTMLElement): void {
    let editingIndex: number | null = null;
    const render = () => {
      tabsRoot.textContent = '';
      this.dataService.sheets.forEach((sheet, index) => {
        const tab = document.createElement('div');
        tab.className = 'lyra-sheet-tab';
        tab.dataset['lyraSheetIndex'] = `${index}`;
        if (sheet.selected) {
          tab.classList.add('selected');
        }
        tab.addEventListener('click', () =>
          this.tabsController.selectSheet(index),
        );
        tab.addEventListener('dblclick', () =>
          this.tabsController.editSheetName(index),
        );

        if (editingIndex === index) {
          const input = document.createElement('input');
          input.className = 'name-input';
          input.type = 'text';
          input.value = sheet.name;
          input.addEventListener('keydown', (evt) => {
            if ((evt as KeyboardEvent).key === 'Enter') {
              this.tabsController.triggerBlur(evt);
            }
          });
          input.addEventListener('blur', (evt) => {
            this.tabsController.updateSheetName(evt, index);
          });
          tab.appendChild(input);
        } else {
          const label = document.createElement('span');
          label.textContent = sheet.name;
          tab.appendChild(label);
        }
        tabsRoot.appendChild(tab);
      });

      const addTab = document.createElement('div');
      addTab.className = 'lyra-sheet-tab';
      addTab.dataset['lyraAddSheet'] = 'true';
      addTab.textContent = '+';
      addTab.addEventListener('click', () => this.tabsController.addSheet());
      tabsRoot.appendChild(addTab);
    };

    this.lifecycle.add(this.tabsController.tabs$.subscribe(render));
    this.lifecycle.add(
      this.tabsController.editingIndex$.subscribe((index) => {
        editingIndex = index;
        render();
        const input = tabsRoot.querySelector(
          `[data-lyra-sheet-index="${index}"] .name-input`,
        ) as HTMLInputElement | null;
        input?.select();
      }),
    );
    render();
  }

  private bindContextMenu(contextMenuRoot: HTMLElement): void {
    const mainTree = document.createElement('div');
    mainTree.className = 'lyra-sheet-contextmenu-tree';
    const subTree = document.createElement('div');
    subTree.className = 'lyra-sheet-contextmenu-tree';
    let subMenuTop = 0;
    let subMenuLeft = 0;
    const updateSubMenuTransform = () => {
      subTree.style.transform = `translate(${subMenuLeft}px,${subMenuTop}px)`;
    };
    contextMenuRoot.appendChild(mainTree);
    contextMenuRoot.appendChild(subTree);

    this.lifecycle.add(
      this.contextMenuController.menus$.subscribe((menus) => {
        this.renderContextMenus(mainTree, menus);
      }),
    );
    this.lifecycle.add(
      this.contextMenuController.activatedSubMenus$.subscribe((menus) => {
        this.renderContextMenus(subTree, menus);
      }),
    );
    this.lifecycle.add(
      this.contextMenuController.offsetTop$.subscribe((top) => {
        subMenuTop = top;
        updateSubMenuTransform();
      }),
    );
    this.lifecycle.add(
      this.contextMenuController.offsetLeft$.subscribe((left) => {
        subMenuLeft = left;
        updateSubMenuTransform();
      }),
    );
  }

  private renderContextMenus(root: HTMLElement, menus: ContextMenus): void {
    root.textContent = '';
    menus.forEach((menu) => {
      if (menu === 'DIVIDER') {
        root.appendChild(this.createDivider('horizontal'));
        return;
      }

      const item = document.createElement('div');
      item.className = 'lyra-sheet-dropdown-bar';
      item.dataset['lyraContextMenuItem'] = 'true';
      const content = document.createElement('div');
      content.className = 'lyra-sheet-toolbar-dropdown-bar-content';
      const label = document.createElement('span');
      label.textContent = menu.label;
      const desc = document.createElement('span');
      desc.className = 'lyra-sheet-toolbar-dropdown-bar-desc';
      desc.dataset['lyraContextMenuDesc'] = 'true';
      desc.textContent = menu.children ? '>' : menu.desc || ' ';
      content.appendChild(label);
      content.appendChild(desc);
      item.appendChild(content);
      if (menu.children) {
        item.addEventListener('mouseenter', (evt) =>
          this.contextMenuController.showSubMenus(evt, menu.children),
        );
      } else {
        item.addEventListener('mouseenter', (evt) =>
          this.contextMenuController.showSubMenus(evt),
        );
        item.addEventListener('click', () => menu.action());
      }
      root.appendChild(item);
    });
  }

  private createDivider(direction: 'vertical' | 'horizontal'): HTMLElement {
    const divider = document.createElement('div');
    divider.className = `lyra-sheet-divider ${direction}`;
    return divider;
  }
}
