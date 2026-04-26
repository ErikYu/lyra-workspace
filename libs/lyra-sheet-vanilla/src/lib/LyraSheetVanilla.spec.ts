import 'reflect-metadata';
import { Data, DatasheetConfig } from '@lyra-sheet/core';
import { LyraSheetVanilla } from './LyraSheetVanilla';

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

const dataWithRichText: Data = {
  sheets: [
    {
      name: 'Sheet1',
      selected: true,
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
        rowCount: 10,
        cols: {},
        colCount: 5,
      },
    },
  ],
};

const dataWithTwoSheets: Data = {
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
    {
      name: 'Sheet2',
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

describe('LyraSheetVanilla', () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as CanvasRenderingContext2D);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('notifies consumers when core data changes', () => {
    const host = document.createElement('div');
    const onDataChange = jest.fn();
    const sheet = new LyraSheetVanilla({ data, config, onDataChange });

    sheet.mount(host);
    sheet.getDataServiceForTesting().notifyDataChange();

    expect(onDataChange).toHaveBeenCalledWith(data);
  });

  it('removes DOM and stops data change callbacks after destroy', () => {
    const host = document.createElement('div');
    const onDataChange = jest.fn();
    const sheet = new LyraSheetVanilla({ data, config, onDataChange });

    sheet.mount(host);
    sheet.destroy();
    sheet.getDataServiceForTesting().notifyDataChange();

    expect(host.querySelector('.lyra-sheet')).toBeNull();
    expect(onDataChange).not.toHaveBeenCalled();
  });

  it('sizes the root from config and updates it on window resize', () => {
    const host = document.createElement('div');
    let width = 800;
    let height = 400;
    const dynamicConfig: DatasheetConfig = {
      ...config,
      width: () => width,
      height: () => height,
    };
    const sheet = new LyraSheetVanilla({ data, config: dynamicConfig });

    sheet.mount(host);
    const root = host.querySelector('.lyra-sheet') as HTMLElement;

    expect(root.style.width).toBe('800px');
    expect(root.style.height).toBe('400px');

    width = 900;
    height = 450;
    window.dispatchEvent(new Event('resize'));

    expect(root.style.width).toBe('900px');
    expect(root.style.height).toBe('450px');

    sheet.destroy();
    width = 1000;
    height = 500;
    window.dispatchEvent(new Event('resize'));

    expect(root.style.width).toBe('900px');
    expect(root.style.height).toBe('450px');
  });

  it('syncs selected cell content through the formula bar and rich text input', () => {
    const host = document.createElement('div');
    const sheet = new LyraSheetVanilla({ data: dataWithRichText, config });

    sheet.mount(host);
    sheet.getDataServiceForTesting().selectedSheet.selectCell(1, 1);

    const formulaLabel = host.querySelector('.lyra-sheet-formula-bar-label');
    const formulaInput = host.querySelector(
      '.lyra-sheet-formula-bar-input',
    ) as HTMLDivElement;
    const richTextInput = host.querySelector(
      '.lyra-sheet-rich-text-input-area',
    ) as HTMLDivElement;

    expect(formulaLabel?.textContent).toBe('B2');
    expect(formulaInput.innerHTML).toContain('123');

    formulaInput.innerHTML = '<div>456</div>';
    formulaInput.dispatchEvent(new Event('focusin'));
    formulaInput.dispatchEvent(new Event('input'));

    expect(richTextInput.innerHTML).toBe('<div>456</div>');
  });

  it('renders tabs and supports selecting, adding, and renaming sheets', () => {
    const host = document.createElement('div');
    const sheet = new LyraSheetVanilla({ data: dataWithTwoSheets, config });

    sheet.mount(host);

    expect(tabNames(host)).toEqual(['Sheet1', 'Sheet2']);
    expect(
      host.querySelector('[data-lyra-sheet-index="0"]')?.classList,
    ).toContain('selected');

    host
      .querySelector('[data-lyra-sheet-index="1"]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(sheet.getDataServiceForTesting().selectedIndex).toBe(1);
    expect(
      host.querySelector('[data-lyra-sheet-index="1"]')?.classList,
    ).toContain('selected');

    host
      .querySelector('[data-lyra-add-sheet]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(tabNames(host)).toEqual(['Sheet1', 'Sheet2', 'Unnamed Sheet (2)']);

    const firstTab = host.querySelector('[data-lyra-sheet-index="0"]')!;
    firstTab.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    const input = host.querySelector(
      '[data-lyra-sheet-index="0"] .name-input',
    ) as HTMLInputElement;
    input.value = 'Renamed';
    input.dispatchEvent(new Event('blur', { bubbles: true }));

    expect(tabNames(host)).toEqual(['Renamed', 'Sheet2', 'Unnamed Sheet (2)']);
  });

  it('renders context menu items and runs their actions', () => {
    const host = document.createElement('div');
    const sheet = new LyraSheetVanilla({ data, config });

    sheet.mount(host);
    sheet.getDataServiceForTesting().selectedSheet.selectCell(1, 1);
    const mask = host.querySelector('.lyra-sheet-editor-mask')!;
    const event = new MouseEvent('contextmenu', { bubbles: true });
    Object.defineProperty(event, 'offsetX', { value: 10 });
    Object.defineProperty(event, 'offsetY', { value: 20 });

    mask.dispatchEvent(event);

    const menu = host.querySelector('.lyra-sheet-contextmenu') as HTMLElement;
    const items = Array.from(
      menu.querySelectorAll('[data-lyra-context-menu-item]'),
    ).map((item) => item.textContent?.trim());

    expect(menu.style.display).toBe('flex');
    expect(items).toContain('Insert row');
    expect(
      menu.querySelector(
        '[data-lyra-context-menu-item] .lyra-sheet-toolbar-dropdown-bar-content',
      ),
    ).toBeTruthy();
    expect(
      menu.querySelector('[data-lyra-context-menu-desc]')?.textContent,
    ).toBeTruthy();

    menu
      .querySelector('[data-lyra-context-menu-item]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(sheet.getDataServiceForTesting().selectedSheet.getRowCount()).toBe(
      11,
    );
  });

  it('renders selected cell and autofill affordance in the selector layer', () => {
    const host = document.createElement('div');
    const sheet = new LyraSheetVanilla({ data, config });

    sheet.mount(host);
    sheet.getDataServiceForTesting().selectedSheet.selectCell(1, 1);

    const selector = host.querySelector('.lyra-sheet-selector') as HTMLElement;
    const autofill = host.querySelector(
      '.lyra-sheet-selector-autofill',
    ) as HTMLElement;

    expect(selector).toBeTruthy();
    expect(selector.style.left).toBe('100px');
    expect(selector.style.top).toBe('25px');
    expect(selector.style.width).toBe('100px');
    expect(selector.style.height).toBe('25px');
    expect(autofill).toBeTruthy();
    expect(autofill.style.left).toBe('196px');
    expect(autofill.style.top).toBe('46px');
  });
});

function tabNames(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll('[data-lyra-sheet-index]')).map(
    (tab) => tab.textContent || '',
  );
}
