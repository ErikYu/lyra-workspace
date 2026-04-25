import { createElement } from './createElement';

export function renderRichTextInput(): HTMLElement {
  const root = createElement('div', 'lyra-sheet-rich-text-input');
  const input = createElement('div', 'lyra-sheet-rich-text-input-area');
  input.setAttribute('contenteditable', 'true');
  root.appendChild(input);
  return root;
}
