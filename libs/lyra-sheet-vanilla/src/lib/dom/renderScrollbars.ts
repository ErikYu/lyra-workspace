import { createElement } from './createElement';

export interface RenderedScrollbars {
  vertical: HTMLElement;
  horizontal: HTMLElement;
}

export function renderScrollbars(): RenderedScrollbars {
  return {
    vertical: createElement('div', 'lyra-sheet-scrollbar-v'),
    horizontal: createElement('div', 'lyra-sheet-scrollbar-h'),
  };
}
