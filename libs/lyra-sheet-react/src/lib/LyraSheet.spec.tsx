import 'reflect-metadata';
import { render } from '@testing-library/react';
import React from 'react';
import { Data, DatasheetConfig } from '@lyra-sheet/core';
import { LyraSheetVanilla } from '@lyra-sheet/vanilla';

import LyraSheetReact from './LyraSheet';

const mockMount = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.mock('@lyra-sheet/vanilla', () => ({
  LyraSheetVanilla: jest.fn().mockImplementation(() => ({
    mount: mockMount,
    update: mockUpdate,
    destroy: mockDestroy,
  })),
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

describe('LyraSheetReact', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('mounts vanilla sheet on a host element', () => {
    render(<LyraSheetReact data={data} config={config} />);

    expect(LyraSheetVanilla).toHaveBeenCalledWith({
      data,
      config,
      onDataChange: undefined,
    });
    expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('updates vanilla sheet when props change', () => {
    const onDataChange = jest.fn();
    const nextData = { sheets: [{ ...data.sheets[0], name: 'Next' }] };
    const { rerender } = render(
      <LyraSheetReact
        data={data}
        config={config}
        onDataChange={onDataChange}
      />,
    );

    rerender(
      <LyraSheetReact
        data={nextData}
        config={config}
        onDataChange={onDataChange}
      />,
    );

    expect(mockUpdate).toHaveBeenLastCalledWith({
      data: nextData,
      config,
      onDataChange,
    });
  });

  it('destroys vanilla sheet on unmount', () => {
    const { unmount } = render(<LyraSheetReact data={data} config={config} />);

    unmount();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });
});
