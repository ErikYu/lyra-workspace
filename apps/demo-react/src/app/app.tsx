// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import { LyraSheet } from '@lyra-sheet/react';
import { Data, DatasheetConfig } from '@lyra-sheet/core';

export function App() {
  const data: Data = {
    sheets: [
      {
        name: 'Sheet1',
        data: {
          merges: [],
          rows: {
            1: {
              cells: { 1: { richText: [[{ text: 'hey' }]] } },
            },
          },
          rowCount: 100,
          cols: {},
          colCount: 30,
        },
        selected: true,
      },
    ],
  };
  const config: DatasheetConfig = {
    width: () => document.documentElement.clientWidth,
    height: () => document.documentElement.clientHeight,
    row: {
      height: 30,
      count: 100,
      indexHeight: 25,
    },
    col: {
      width: 100,
      count: 30,
      indexWidth: 60,
    },
  };
  return <LyraSheet data={data} config={config}></LyraSheet>;
}

export default App;
