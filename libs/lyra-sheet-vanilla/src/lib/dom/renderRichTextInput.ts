import { createElement } from './createElement';

export interface RenderedRichTextInput {
  root: HTMLElement;
  editable: HTMLDivElement;
}

export function renderRichTextInput(): RenderedRichTextInput {
  const root = createElement('div', 'lyra-sheet-rich-text-input');
  const input = createElement('div', 'lyra-sheet-rich-text-input-area');
  input.setAttribute('contenteditable', 'true');
  root.appendChild(input);
  return { root, editable: input };
}
