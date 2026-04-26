import { Data, DatasheetConfig } from '@lyra-sheet/core';

const STORAGE_KEY = 'lyra-sheet-demo-vanilla:data';

export function createDemoData(): Data {
  const cache = localStorage.getItem(STORAGE_KEY);
  if (cache) {
    return JSON.parse(cache) as Data;
  }

  return {
    sheets: [
      {
        name: 'Sheet1',
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
          rowCount: 100,
          cols: {
            1: {
              width: 95,
            },
          },
          colCount: 30,
        },
        selected: true,
      },
    ],
  };
}

export function createDemoConfig(): DatasheetConfig {
  return {
    width: () => document.documentElement.clientWidth,
    height: () => document.documentElement.clientHeight,
    row: { height: 25, count: 100, indexHeight: 25 },
    col: { width: 100, count: 30, indexWidth: 60 },
  };
}

export function saveDemoData(data: Data): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
