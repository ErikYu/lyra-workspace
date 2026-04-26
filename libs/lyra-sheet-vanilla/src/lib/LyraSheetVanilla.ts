import {
  cloneDeep,
  ConfigService,
  Data,
  DataService,
  DatasheetConfig,
  EditorController,
  ElementRefService,
  FormulaBarController,
  HistoryService,
  RichTextInputController,
  RootController,
  ViewRangeService,
} from '@lyra-sheet/core';
import { DependencyContainer } from 'tsyringe';
import { createVanillaContainer } from './createVanillaContainer';
import { renderEditor, RenderedEditor } from './dom/renderEditor';
import {
  renderFormulaBar,
  RenderedFormulaBar,
} from './dom/renderFormulaBar';
import { renderToolbar } from './dom/renderToolbar';
import { SubscriptionBag } from './lifecycle/SubscriptionBag';

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
  private readonly richTextInputController: RichTextInputController;
  private readonly rootController: RootController;
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
    this.richTextInputController = this.container.resolve(
      RichTextInputController,
    );
    this.rootController = this.container.resolve(RootController);
    this.viewRangeService = this.container.resolve(ViewRangeService);
  }

  mount(host: HTMLElement): void {
    this.destroy();

    const root = document.createElement('div');
    root.className = 'lyra-sheet';
    root.appendChild(renderToolbar(this.container));
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
    this.richTextInputController.mount(
      editor.richTextInput.root,
      editor.richTextInput.editable,
    );
    this.editorController.mountDom(editor.root);
    this.editorController.onInit();
    this.editorController.afterViewInit();
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
}
