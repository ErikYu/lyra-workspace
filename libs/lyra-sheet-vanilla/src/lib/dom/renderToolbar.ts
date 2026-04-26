import { DependencyContainer } from 'tsyringe';
import {
  AngularParityToolbarAction,
  angularParityToolbarActions,
} from '../parity/angularParity';
import { toolbarIconSvg } from '../icons/toolbarIconSvg';
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

const dropdownOptions: Partial<
  Record<AngularParityToolbarAction, Array<{ label: string; value: string }>>
> = {
  format: [
    { label: 'Auto', value: '' },
    { label: 'Plain text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Percent', value: 'percent' },
    { label: 'Scientific', value: 'scientific' },
    { label: 'Accounting', value: 'accounting' },
    { label: 'Financial', value: 'financial' },
    { label: 'Currency', value: 'currency' },
    { label: 'Currency(rounded)', value: 'currency_rounded' },
    { label: 'Date', value: 'date' },
    { label: 'Time', value: 'time' },
    { label: 'Datetime', value: 'datetime' },
  ],
  'font-family': [
    { label: 'Arial', value: 'Arial' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Helvetica', value: 'Helvetica' },
  ],
  'font-size': [
    { label: '8', value: '8:11' },
    { label: '9', value: '9:12' },
    { label: '10', value: '10:13' },
    { label: '10.5', value: '10.5:14' },
    { label: '11', value: '11:15' },
    { label: '12', value: '12:16' },
    { label: '14', value: '14:18.7' },
    { label: '15', value: '15:20' },
    { label: '16', value: '16:21.3' },
    { label: '18', value: '18:24' },
    { label: '22', value: '22:30' },
    { label: '24', value: '24:32' },
    { label: '26', value: '26:35' },
    { label: '36', value: '36:48' },
    { label: '42', value: '42:56' },
  ],
  'font-color': [
    { label: 'Black', value: '#000000' },
    { label: 'Red', value: '#ff0000' },
    { label: 'Blue', value: '#1890ff' },
  ],
  'background-color': [
    { label: 'White', value: '#ffffff' },
    { label: 'Yellow', value: '#fff2cc' },
    { label: 'Blue', value: '#d9eaff' },
  ],
  border: [
    { label: 'All borders', value: 'all' },
    { label: 'Inner borders', value: 'inner' },
    { label: 'Outer borders', value: 'outer' },
    { label: 'Clear borders', value: 'clear' },
  ],
  align: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  valign: [
    { label: 'Bottom', value: 'bottom' },
    { label: 'Middle', value: 'center' },
    { label: 'Top', value: 'top' },
  ],
  'text-wrap': [
    { label: 'Overflow', value: 'overflow' },
    { label: 'Wrap', value: 'wrap' },
    { label: 'Clip', value: 'clip' },
  ],
  formula: [
    { label: 'SUM', value: 'SUM' },
    { label: 'AVERAGE', value: 'AVERAGE' },
    { label: 'MAX', value: 'MAX' },
    { label: 'MIN', value: 'MIN' },
    { label: 'IF', value: 'IF' },
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' },
  ],
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
    item.appendChild(createIcon(action, toolbarIconLabels[action] || action));
  }
  const dropdown = createDropdown(action);
  if (dropdown) {
    item.classList.add('lyra-sheet-dropdown');
    item.appendChild(createElement('span', 'lyra-sheet-toolbar-caret'));
    item.appendChild(dropdown);
  }

  return item;
}

function createTextLabel(
  action: AngularParityToolbarAction,
  label: string,
): HTMLElement {
  const root = createElement('div');
  root.classList.add('lyra-sheet-toolbar-label');
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

function createIcon(
  action: AngularParityToolbarAction,
  fallbackLabel: string,
): SVGSVGElement {
  const svgMarkup = toolbarIconSvg[action];
  if (svgMarkup) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = svgMarkup.replace(/<\?xml.*?\?>/, '').trim();
    const svg = wrapper.firstElementChild as SVGSVGElement;
    svg.classList.add('lyra-sheet-toolbar-icon');
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }

  return createPlaceholderIcon(fallbackLabel);
}

function createPlaceholderIcon(label: string): SVGSVGElement {
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

function createDropdown(action: AngularParityToolbarAction): HTMLElement | null {
  const options = dropdownOptions[action];
  if (!options) {
    return null;
  }

  const menu = createElement('div', 'lyra-sheet-dropdown-menu');
  menu.hidden = true;
  options.forEach((option) => {
    const item = createElement('div', 'lyra-sheet-dropdown-option');
    item.dataset['lyraDropdownValue'] = option.value;
    item.textContent = option.label;
    menu.appendChild(item);
  });

  return menu;
}

function assertToolbarLayoutComplete(): void {
  const renderedActions = toolbarLayout.filter(
    (item): item is AngularParityToolbarAction => typeof item === 'string',
  );
  if (renderedActions.length !== angularParityToolbarActions.length) {
    throw new Error('Vanilla toolbar layout is missing Angular parity actions');
  }
}
