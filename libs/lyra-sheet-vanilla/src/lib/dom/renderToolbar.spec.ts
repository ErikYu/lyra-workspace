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

  it('renders visible toolbar icons, labels, and Angular dividers', () => {
    const toolbar = renderToolbar();

    expect(toolbar.querySelectorAll('.lyra-sheet-divider.vertical')).toHaveLength(
      7,
    );
    [
      'undo',
      'redo',
      'decimal-reduce',
      'decimal-add',
      'bold',
      'italic',
      'strike',
      'underline',
      'background-color',
      'border',
      'merge',
      'align',
      'valign',
      'text-wrap',
      'formula',
    ].forEach((action) => {
      expect(
        toolbar.querySelector(
          `[data-lyra-action="${action}"] .lyra-sheet-toolbar-icon`,
        ),
      ).toBeTruthy();
    });
    [
      ['percent', '%'],
      ['currency', '$'],
      ['format', 'Auto'],
      ['font-family', 'Arial'],
      ['font-size', '10'],
      ['font-color', 'A'],
    ].forEach(([action, label]) => {
      expect(
        toolbar.querySelector(`[data-lyra-action="${action}"]`)?.textContent,
      ).toContain(label);
    });
  });

  it('renders dropdown menus for actions that use dropdown UI', () => {
    const toolbar = renderToolbar();

    [
      'format',
      'font-family',
      'font-size',
      'font-color',
      'background-color',
      'border',
      'align',
      'valign',
      'text-wrap',
      'formula',
    ].forEach((action) => {
      const menu = toolbar.querySelector(
        `[data-lyra-action="${action}"] .lyra-sheet-dropdown-menu`,
      ) as HTMLElement;

      expect(menu).toBeTruthy();
      expect(menu.hidden).toBe(true);
      expect(menu.querySelectorAll('[data-lyra-dropdown-value]').length).toBeGreaterThan(
        0,
      );
    });
  });
});
