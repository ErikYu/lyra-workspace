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
});
