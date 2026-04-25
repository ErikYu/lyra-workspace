import { angularParityToolbarActions } from '../parity/angularParity';
import { renderToolbar } from './renderToolbar';

describe('renderToolbar', () => {
  it('renders a stable button for every Angular toolbar action', () => {
    const toolbar = renderToolbar();

    expect(toolbar.classList.contains('lyra-sheet-toolbar')).toBe(true);
    angularParityToolbarActions.forEach((action) => {
      expect(toolbar.querySelector(`[data-lyra-action="${action}"]`)).toBeTruthy();
    });
  });
});
