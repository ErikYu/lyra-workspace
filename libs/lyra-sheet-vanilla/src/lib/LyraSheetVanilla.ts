import { Data, DatasheetConfig } from '@lyra-sheet/core';

export interface LyraSheetVanillaOptions {
  data: Data;
  config: DatasheetConfig;
  onDataChange?: (data: Data) => void;
}

export class LyraSheetVanilla {
  private rootEl: HTMLDivElement | null = null;
  private options: LyraSheetVanillaOptions;

  constructor(options: LyraSheetVanillaOptions) {
    this.options = options;
  }

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
