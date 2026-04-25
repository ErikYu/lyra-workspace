import 'reflect-metadata';
import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { Data, DataService, DatasheetConfig } from '@lyra-sheet/core';

import LyraSheetReact from './LyraSheet';
import {
  createLyraSheetContainer,
  useLyraSheetCore,
} from './container-context';

jest.mock('./components/Toolbar', () => ({
  LyraSheetToolbar: () => <div data-testid="toolbar" />,
}));

jest.mock('./components/FormulaBar', () => ({
  LyraSheetFormulaBar: () => <div data-testid="formula-bar" />,
}));

jest.mock('./components/Editor', () => ({
  LyraSheetEditor: () => <div data-testid="editor" />,
}));

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
  row: {
    height: 25,
    count: 10,
    indexHeight: 25,
  },
  col: {
    width: 100,
    count: 5,
    indexWidth: 60,
  },
};

function NotifyDataChangeOnMount() {
  const dataService = useLyraSheetCore(DataService);

  useEffect(() => {
    dataService.notifyDataChange();
  }, [dataService]);

  return null;
}

describe('LyraSheetReact', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((message?: unknown, ...optionalParams: unknown[]) => {
        if (
          typeof message === 'string' &&
          message.includes('ReactDOM.render is no longer supported in React 18')
        ) {
          return;
        }
        console.warn(message, ...optionalParams);
      });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('creates an isolated container per sheet instance', () => {
    expect(createLyraSheetContainer()).not.toBe(createLyraSheetContainer());
  });

  it('renders the sheet shell successfully', () => {
    const { container, getByTestId } = render(
      <LyraSheetReact data={data} config={config} />,
    );

    expect(container.querySelector('.lyra-sheet')).toBeTruthy();
    expect(getByTestId('toolbar')).toBeTruthy();
    expect(getByTestId('formula-bar')).toBeTruthy();
    expect(getByTestId('editor')).toBeTruthy();
  });

  it('notifies consumers when core data changes', () => {
    const onDataChange = jest.fn();

    render(
      <LyraSheetReact data={data} config={config} onDataChange={onDataChange}>
        <NotifyDataChangeOnMount />
      </LyraSheetReact>,
    );

    expect(onDataChange).toHaveBeenCalledWith(data);
  });
});
