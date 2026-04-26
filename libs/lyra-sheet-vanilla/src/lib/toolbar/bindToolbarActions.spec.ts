import 'reflect-metadata';
import {
  DataService,
  DecimalController,
  FontBoldController,
  FontItalicController,
  FontStrikeController,
  FontUnderlineController,
  HistoryService,
  MergeController,
} from '@lyra-sheet/core';
import { DependencyContainer } from 'tsyringe';
import { renderToolbar } from '../dom/renderToolbar';
import { bindToolbarActions } from './bindToolbarActions';

describe('bindToolbarActions', () => {
  const range = { sri: 1, sci: 1, eri: 1, eci: 1 };
  let historyService: { undo: jest.Mock; redo: jest.Mock; stacked: jest.Mock };
  let dataService: {
    selectedSheet: {
      selectors: Array<{ range: typeof range }>;
      resetPrecisionTo: jest.Mock;
      applyCellFormatTo: jest.Mock;
    };
    rerender: jest.Mock;
  };
  let decimalController: { execute: jest.Mock };
  let fontBoldController: { toggle: jest.Mock };
  let fontItalicController: { toggle: jest.Mock };
  let fontStrikeController: { toggle: jest.Mock };
  let fontUnderlineController: { toggle: jest.Mock };
  let mergeController: { applyMerge: jest.Mock };
  let container: Pick<DependencyContainer, 'resolve'>;
  let toolbar: HTMLElement;

  beforeEach(() => {
    historyService = {
      undo: jest.fn(),
      redo: jest.fn(),
      stacked: jest.fn((work: () => void) => work()),
    };
    dataService = {
      selectedSheet: {
        selectors: [{ range }],
        resetPrecisionTo: jest.fn(),
        applyCellFormatTo: jest.fn(),
      },
      rerender: jest.fn(),
    };
    decimalController = { execute: jest.fn() };
    fontBoldController = { toggle: jest.fn() };
    fontItalicController = { toggle: jest.fn() };
    fontStrikeController = { toggle: jest.fn() };
    fontUnderlineController = { toggle: jest.fn() };
    mergeController = { applyMerge: jest.fn() };

    const tokenMap = new Map<unknown, unknown>([
      [HistoryService, historyService],
      [DataService, dataService],
      [DecimalController, decimalController],
      [FontBoldController, fontBoldController],
      [FontItalicController, fontItalicController],
      [FontStrikeController, fontStrikeController],
      [FontUnderlineController, fontUnderlineController],
      [MergeController, mergeController],
    ]);
    container = {
      resolve: jest.fn((token: unknown) => tokenMap.get(token)),
    } as Pick<DependencyContainer, 'resolve'>;
    toolbar = renderToolbar(container as DependencyContainer);
    bindToolbarActions(toolbar, container as DependencyContainer);
  });

  it('binds undo and redo actions to history service', () => {
    click('undo');
    click('redo');

    expect(historyService.undo).toHaveBeenCalledTimes(1);
    expect(historyService.redo).toHaveBeenCalledTimes(1);
  });

  it('binds percent and currency actions to selected sheet formats', () => {
    click('percent');
    click('currency');

    expect(historyService.stacked).toHaveBeenCalledTimes(2);
    expect(dataService.selectedSheet.resetPrecisionTo).toHaveBeenCalledWith(
      range,
    );
    expect(dataService.selectedSheet.applyCellFormatTo).toHaveBeenCalledWith(
      range,
      'percent',
    );
    expect(dataService.selectedSheet.applyCellFormatTo).toHaveBeenCalledWith(
      range,
      'currency',
    );
    expect(dataService.rerender).toHaveBeenCalledTimes(2);
  });

  it('binds decimal actions to the decimal controller', () => {
    click('decimal-reduce');
    click('decimal-add');

    expect(decimalController.execute).toHaveBeenCalledWith('reduce');
    expect(decimalController.execute).toHaveBeenCalledWith('add');
  });

  it('binds text style actions to toggle controllers', () => {
    click('bold');
    click('italic');
    click('strike');
    click('underline');

    expect(fontBoldController.toggle).toHaveBeenCalledTimes(1);
    expect(fontItalicController.toggle).toHaveBeenCalledTimes(1);
    expect(fontStrikeController.toggle).toHaveBeenCalledTimes(1);
    expect(fontUnderlineController.toggle).toHaveBeenCalledTimes(1);
  });

  it('binds merge action to the merge controller', () => {
    click('merge');

    expect(mergeController.applyMerge).toHaveBeenCalledTimes(1);
  });

  it('returns cleanup for the toolbar listener', () => {
    const secondToolbar = renderToolbar(container as DependencyContainer);
    const cleanup = bindToolbarActions(
      secondToolbar,
      container as DependencyContainer,
    );

    cleanup();
    secondToolbar
      .querySelector('[data-lyra-action="undo"]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(historyService.undo).not.toHaveBeenCalled();
  });

  function click(action: string): void {
    toolbar
      .querySelector(`[data-lyra-action="${action}"]`)!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
});
