import { createElement } from './createElement';

export interface RenderedFormulaBar {
  root: HTMLElement;
  label: HTMLElement;
  textarea: HTMLDivElement;
}

export function renderFormulaBar(): RenderedFormulaBar {
  const root = createElement('div', 'lyra-sheet-formula-bar');
  const label = createElement('div', 'lyra-sheet-formula-bar-label');
  const fx = createElement('div', 'lyra-sheet-formula-bar-fx');
  fx.textContent = 'fx';
  const textarea = createElement('div', 'lyra-sheet-formula-bar-input');
  textarea.setAttribute('contenteditable', 'true');
  root.appendChild(label);
  root.appendChild(createElement('div', 'lyra-sheet-divider vertical'));
  root.appendChild(fx);
  root.appendChild(createElement('div', 'lyra-sheet-divider vertical'));
  root.appendChild(textarea);
  return { root, label, textarea };
}
