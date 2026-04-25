import 'reflect-metadata';
import { Data } from '../types';
import { DataService } from './data.service';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  const initialData: Data = {
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

  function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  function createHarness() {
    let currentData = clone(initialData);
    const dataService = {
      get selectedIndex() {
        return 0;
      },
      get selectedSheet() {
        return { selectors: [] };
      },
      get snapshot() {
        return currentData;
      },
      loadData: jest.fn((data: Data) => {
        currentData = clone(data);
      }),
      rerender: jest.fn(),
      notifyDataChange: jest.fn(),
    } as unknown as DataService;

    return {
      dataService,
      history: new HistoryService(dataService),
      setCurrentData(data: Data) {
        currentData = clone(data);
      },
      getCurrentData() {
        return currentData;
      },
    };
  }

  it('restores the previous data snapshot on undo', () => {
    const { history, setCurrentData, getCurrentData } = createHarness();
    const nextData = clone(initialData);
    nextData.sheets[0].data.rows[1] = {
      cells: {
        1: { richText: [[{ text: 'next' }]] },
      },
    };

    history.init(initialData);
    history.stacked(() => setCurrentData(nextData), { si: 0, ri: 1, ci: 1 });
    history.undo();

    expect(getCurrentData()).toEqual(initialData);
  });

  it('restores the next data snapshot on redo', () => {
    const { history, setCurrentData, getCurrentData } = createHarness();
    const nextData = clone(initialData);
    nextData.sheets[0].data.rows[1] = {
      cells: {
        1: { richText: [[{ text: 'next' }]] },
      },
    };

    history.init(initialData);
    history.stacked(() => setCurrentData(nextData), { si: 0, ri: 1, ci: 1 });
    history.undo();
    history.redo();

    expect(getCurrentData()).toEqual(nextData);
  });
});
