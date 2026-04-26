import { createElement } from './createElement';
import {
  renderRichTextInput,
  RenderedRichTextInput,
} from './renderRichTextInput';
import { renderScrollbars } from './renderScrollbars';
import { renderSelectorLayer } from './renderSelectorLayer';
import { renderTabs } from './renderTabs';

export interface RenderedEditor {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  mask: HTMLElement;
  selectorContainer: HTMLElement;
  rowResizer: HTMLElement;
  colResizer: HTMLElement;
  contextMenu: HTMLElement;
  tabs: HTMLElement;
  richTextInput: RenderedRichTextInput;
}

export function renderEditor(): RenderedEditor {
  const root = createElement('div', 'lyra-sheet-editor');
  const canvas = createElement('canvas');
  const selectorLayer = renderSelectorLayer();
  const rowResizer = createElement('div', 'lyra-sheet-resizer-row');
  const colResizer = createElement('div', 'lyra-sheet-resizer-col');
  const scrollbars = renderScrollbars();
  const richTextInput = renderRichTextInput();
  const contextMenu = createElement('div', 'lyra-sheet-contextmenu');
  const tabs = renderTabs();

  root.appendChild(canvas);
  root.appendChild(selectorLayer.mask);
  root.appendChild(rowResizer);
  root.appendChild(colResizer);
  root.appendChild(scrollbars.vertical);
  root.appendChild(scrollbars.horizontal);
  root.appendChild(contextMenu);
  root.appendChild(tabs);
  root.appendChild(richTextInput.root);

  return {
    root,
    canvas,
    mask: selectorLayer.mask,
    selectorContainer: selectorLayer.selectorContainer,
    rowResizer,
    colResizer,
    contextMenu,
    tabs,
    richTextInput,
  };
}
