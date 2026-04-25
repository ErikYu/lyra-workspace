export const angularParitySelectors = [
  '.lyra-sheet',
  '.lyra-sheet-toolbar',
  '.lyra-sheet-formula-bar',
  '.lyra-sheet-editor',
  '.lyra-sheet-rich-text-input',
  '.lyra-sheet-rich-text-input-area',
  'canvas',
  '.lyra-sheet-editor-mask',
  '.lyra-sheet-resizer-row',
  '.lyra-sheet-resizer-col',
  '.lyra-sheet-scrollbar-v',
  '.lyra-sheet-scrollbar-h',
  '.lyra-sheet-contextmenu',
  '.lyra-sheet-tabs',
] as const;

export const angularParityToolbarActions = [
  'undo',
  'redo',
  'percent',
  'currency',
  'decimal-reduce',
  'decimal-add',
  'format',
  'font-family',
  'font-size',
  'bold',
  'italic',
  'strike',
  'underline',
  'font-color',
  'background-color',
  'border',
  'merge',
  'align',
  'valign',
  'text-wrap',
  'formula',
] as const;

export type AngularParityToolbarAction =
  (typeof angularParityToolbarActions)[number];
