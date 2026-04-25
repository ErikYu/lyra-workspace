import {
  angularParitySelectors,
  angularParityToolbarActions,
} from './angularParity';

describe('angular parity baseline', () => {
  it('documents the DOM selectors vanilla must preserve', () => {
    expect(angularParitySelectors).toContain('.lyra-sheet-toolbar');
    expect(angularParitySelectors).toContain('.lyra-sheet-contextmenu');
    expect(angularParitySelectors).toContain('.lyra-sheet-tabs');
  });

  it('documents the toolbar actions vanilla must preserve', () => {
    expect(angularParityToolbarActions).toContain('bold');
    expect(angularParityToolbarActions).toContain('merge');
    expect(angularParityToolbarActions).toContain('formula');
  });
});
