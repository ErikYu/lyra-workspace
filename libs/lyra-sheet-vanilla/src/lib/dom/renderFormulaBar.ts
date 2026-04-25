import { createElement } from './createElement';

export interface RenderedFormulaBar {
  root: HTMLElement;
  textarea: HTMLDivElement;
}

export function renderFormulaBar(): RenderedFormulaBar {
  const root = createElement('div', 'lyra-sheet-formula-bar');
  const textarea = createElement('div');
  textarea.contentEditable = 'true';
  root.appendChild(textarea);
  return { root, textarea };
}
