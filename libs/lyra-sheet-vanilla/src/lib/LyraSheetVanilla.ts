import {
  cloneDeep,
  ConfigService,
  Data,
  DataService,
  DatasheetConfig,
  ElementRefService,
  HistoryService,
  ViewRangeService,
} from '@lyra-sheet/core';
import { Subscription } from 'rxjs';
import { DependencyContainer } from 'tsyringe';
import { createVanillaContainer } from './createVanillaContainer';
import { renderEditor, RenderedEditor } from './dom/renderEditor';
import { renderFormulaBar } from './dom/renderFormulaBar';
import { renderToolbar } from './dom/renderToolbar';

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
  private readonly historyService: HistoryService;
  private readonly viewRangeService: ViewRangeService;
  private dataChangeSubscription: Subscription | null = null;

  constructor(options: LyraSheetVanillaOptions) {
    this.options = options;
    this.container = createVanillaContainer();
    this.configService = this.container.resolve(ConfigService);
    this.dataService = this.container.resolve(DataService);
    this.elementRefService = this.container.resolve(ElementRefService);
    this.historyService = this.container.resolve(HistoryService);
    this.viewRangeService = this.container.resolve(ViewRangeService);
  }

  mount(host: HTMLElement): void {
    this.destroy();

    const root = document.createElement('div');
    root.className = 'lyra-sheet';
    root.appendChild(renderToolbar(this.container));
    root.appendChild(renderFormulaBar());
    const editor = renderEditor();
    root.appendChild(editor.root);

    host.appendChild(root);
    this.rootEl = root;
    this.initializeCore(root, editor);
  }

  update(options: Partial<LyraSheetVanillaOptions>): void {
    this.options = { ...this.options, ...options };
  }

  destroy(): void {
    this.dataChangeSubscription?.unsubscribe();
    this.dataChangeSubscription = null;
    this.rootEl?.remove();
    this.rootEl = null;
  }

  // Test-only access keeps the public API small while letting unit tests drive core events.
  getDataServiceForTesting(): DataService {
    return this.dataService;
  }

  private initializeCore(root: HTMLDivElement, editor: RenderedEditor): void {
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
    this.dataChangeSubscription = this.dataService.dataChanged$.subscribe(
      (data) => this.options.onDataChange?.(data),
    );
  }
}
