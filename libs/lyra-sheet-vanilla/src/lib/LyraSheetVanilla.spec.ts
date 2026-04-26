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
});
