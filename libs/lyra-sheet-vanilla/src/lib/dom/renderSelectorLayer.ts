import { createElement } from './createElement';

export function renderSelectorLayer(): HTMLElement {
  return createElement('div', 'lyra-sheet-editor-mask');
}
