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
    root.appendChild(this.createToolbar());
    root.appendChild(this.createFormulaBar());
    const { editor, canvas } = this.createEditor();
    root.appendChild(editor);

    host.appendChild(root);
    this.rootEl = root;
    this.initializeCore(root, canvas);
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

  private createEditor(): { editor: HTMLElement; canvas: HTMLCanvasElement } {
    const el = document.createElement('div');
    el.className = 'lyra-sheet-editor';
    const canvas = document.createElement('canvas');
    el.appendChild(canvas);
    return { editor: el, canvas };
  }

  private initializeCore(root: HTMLDivElement, canvas: HTMLCanvasElement): void {
    this.configService.setConfig(this.options.config);
    const initialData = cloneDeep(this.options.data);
    this.dataService.loadData(initialData);
    this.historyService.init(cloneDeep(this.options.data));
    this.elementRefService.initRoot(root);
    this.elementRefService.initCanvas(canvas);
    this.viewRangeService.init();
    this.dataChangeSubscription = this.dataService.dataChanged$.subscribe(
      (data) => this.options.onDataChange?.(data),
    );
  }
}
