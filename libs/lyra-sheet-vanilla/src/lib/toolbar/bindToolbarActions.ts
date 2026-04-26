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
import { AngularParityToolbarAction } from '../parity/angularParity';

export function bindToolbarActions(
  toolbar: HTMLElement,
  container: DependencyContainer,
): () => void {
  const listener = (evt: Event) => {
    const action = (evt as CustomEvent<{ action: AngularParityToolbarAction }>)
      .detail?.action;
    if (!action) {
      return;
    }
    executeToolbarAction(action, container);
  };

  toolbar.addEventListener('lyra-toolbar-action', listener);

  return () => toolbar.removeEventListener('lyra-toolbar-action', listener);
}

function executeToolbarAction(
  action: AngularParityToolbarAction,
  container: DependencyContainer,
): void {
  switch (action) {
    case 'undo':
      container.resolve(HistoryService).undo();
      return;
    case 'redo':
      container.resolve(HistoryService).redo();
      return;
    case 'percent':
      applyCellFormat(container, 'percent');
      return;
    case 'currency':
      applyCellFormat(container, 'currency');
      return;
    case 'decimal-reduce':
      container.resolve(DecimalController).execute('reduce');
      return;
    case 'decimal-add':
      container.resolve(DecimalController).execute('add');
      return;
    case 'bold':
      container.resolve(FontBoldController).toggle();
      return;
    case 'italic':
      container.resolve(FontItalicController).toggle();
      return;
    case 'strike':
      container.resolve(FontStrikeController).toggle();
      return;
    case 'underline':
      container.resolve(FontUnderlineController).toggle();
      return;
    case 'merge':
      container.resolve(MergeController).applyMerge();
      return;
  }
}

function applyCellFormat(
  container: DependencyContainer,
  format: 'percent' | 'currency',
): void {
  const historyService = container.resolve(HistoryService);
  const dataService = container.resolve(DataService);

  historyService.stacked(() => {
    for (const selector of dataService.selectedSheet.selectors) {
      dataService.selectedSheet.resetPrecisionTo(selector.range);
      dataService.selectedSheet.applyCellFormatTo(selector.range, format);
    }
  });
  dataService.rerender();
}
