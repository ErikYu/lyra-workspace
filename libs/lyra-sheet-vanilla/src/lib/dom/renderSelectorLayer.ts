import { createElement } from './createElement';

export interface RenderedSelectorLayer {
  mask: HTMLElement;
  selectorContainer: HTMLElement;
}

export function renderSelectorLayer(): RenderedSelectorLayer {
  const mask = createElement('div', 'lyra-sheet-editor-mask');
  const selectorContainer = createElement(
    'div',
    'lyra-sheet-selector-container',
  );
  mask.appendChild(selectorContainer);

  return { mask, selectorContainer };
}
