import { DependencyContainer } from 'tsyringe';
import {
  AngularParityToolbarAction,
  angularParityToolbarActions,
} from '../parity/angularParity';
import { createElement } from './createElement';

type ToolbarItem =
  | AngularParityToolbarAction
  | {
      divider: true;
    };

const toolbarLayout: ToolbarItem[] = [
  'undo',
  'redo',
  { divider: true },
  'percent',
  'currency',
  'decimal-reduce',
  'decimal-add',
  'format',
  { divider: true },
  'font-family',
  { divider: true },
  'font-size',
  { divider: true },
  'bold',
  'italic',
  'strike',
  'underline',
  'font-color',
  { divider: true },
  'background-color',
  'border',
  'merge',
  { divider: true },
  'align',
  'valign',
  'text-wrap',
  { divider: true },
  'formula',
];

const toolbarLabels: Partial<Record<AngularParityToolbarAction, string>> = {
  percent: '%',
  currency: '$',
  format: 'Auto',
  'font-family': 'Arial',
  'font-size': '10',
  'font-color': 'A',
};

const toolbarIconLabels: Partial<Record<AngularParityToolbarAction, string>> = {
  undo: 'Undo',
  redo: 'Redo',
  'decimal-reduce': '.0',
  'decimal-add': '.00',
  bold: 'B',
  italic: 'I',
  strike: 'S',
  underline: 'U',
  'background-color': 'Bg',
  border: '#',
  merge: 'M',
  align: 'L',
  valign: 'V',
  'text-wrap': 'W',
  formula: 'Fx',
};

export function renderToolbar(container?: DependencyContainer): HTMLElement {
  const toolbar = createElement('div', 'lyra-sheet-toolbar');

  toolbarLayout.forEach((item) => {
    if (typeof item !== 'string') {
      toolbar.appendChild(createElement('div', 'lyra-sheet-divider vertical'));
      return;
    }

    toolbar.appendChild(createToolbarItem(item, container, toolbar));
  });

  assertToolbarLayoutComplete();
  return toolbar;
}

function createToolbarItem(
  action: AngularParityToolbarAction,
  container: DependencyContainer | undefined,
  toolbar: HTMLElement,
): HTMLElement {
  const item = createElement('div', 'lyra-sheet-toolbar-item');
  item.dataset['lyraAction'] = action;
  item.title = action;
  item.addEventListener('mousedown', (evt) => evt.preventDefault());
  item.addEventListener('click', () => {
    toolbar.dispatchEvent(
      new CustomEvent('lyra-toolbar-action', {
        bubbles: true,
        detail: { action, container },
      }),
    );
  });

  const label = toolbarLabels[action];
  if (label) {
    item.appendChild(createTextLabel(action, label));
  } else {
    item.appendChild(createIcon(toolbarIconLabels[action] || action));
  }

  return item;
}

function createTextLabel(
  action: AngularParityToolbarAction,
  label: string,
): HTMLElement {
  const root = createElement('div');
  root.textContent = label;

  if (action === 'font-color') {
    const swatch = createElement('div');
    swatch.style.height = '3px';
    swatch.style.width = '18px';
    swatch.style.backgroundColor = '#000000';
    root.appendChild(swatch);
  }

  return root;
}

function createIcon(label: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('lyra-sheet-toolbar-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '12');
  text.setAttribute('y', '15');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', label.length > 1 ? '8' : '13');
  text.setAttribute('font-family', 'Helvetica, Arial, sans-serif');
  text.setAttribute('font-weight', '600');
  text.textContent = label;
  svg.appendChild(text);

  return svg;
}

function assertToolbarLayoutComplete(): void {
  const renderedActions = toolbarLayout.filter(
    (item): item is AngularParityToolbarAction => typeof item === 'string',
  );
  if (renderedActions.length !== angularParityToolbarActions.length) {
    throw new Error('Vanilla toolbar layout is missing Angular parity actions');
  }
}
