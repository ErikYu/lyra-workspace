import { DependencyContainer } from 'tsyringe';
import { angularParityToolbarActions } from '../parity/angularParity';
import { createElement } from './createElement';

export function renderToolbar(container?: DependencyContainer): HTMLElement {
  const toolbar = createElement('div', 'lyra-sheet-toolbar');

  angularParityToolbarActions.forEach((action) => {
    const button = createElement('button');
    button.type = 'button';
    button.dataset.lyraAction = action;
    button.addEventListener('click', () => {
      toolbar.dispatchEvent(
        new CustomEvent('lyra-toolbar-action', {
          bubbles: true,
          detail: { action, container },
        }),
      );
    });
    toolbar.appendChild(button);
  });

  return toolbar;
}
