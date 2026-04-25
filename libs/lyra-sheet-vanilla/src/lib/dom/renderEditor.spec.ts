import { renderEditor } from './renderEditor';

describe('renderEditor', () => {
  it('renders the Angular editor DOM baseline', () => {
    const editor = renderEditor();

    expect(editor.root.classList.contains('lyra-sheet-editor')).toBe(true);
    expect(editor.root.querySelector('.lyra-sheet-rich-text-input')).toBeTruthy();
    expect(
      editor.root.querySelector(
        '.lyra-sheet-rich-text-input-area[contenteditable="true"]',
      ),
    ).toBeTruthy();
    expect(editor.root.querySelector('canvas')).toBe(editor.canvas);
    expect(editor.root.querySelector('.lyra-sheet-editor-mask')).toBe(
      editor.mask,
    );
    expect(editor.root.querySelector('.lyra-sheet-resizer-row')).toBe(
      editor.rowResizer,
    );
    expect(editor.root.querySelector('.lyra-sheet-resizer-col')).toBe(
      editor.colResizer,
    );
    expect(editor.root.querySelector('.lyra-sheet-scrollbar-v')).toBeTruthy();
    expect(editor.root.querySelector('.lyra-sheet-scrollbar-h')).toBeTruthy();
    expect(editor.root.querySelector('.lyra-sheet-contextmenu')).toBeTruthy();
    expect(editor.root.querySelector('.lyra-sheet-tabs')).toBeTruthy();
  });
});
