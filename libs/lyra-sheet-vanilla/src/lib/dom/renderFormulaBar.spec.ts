import { renderFormulaBar } from './renderFormulaBar';

describe('renderFormulaBar', () => {
  it('renders the Angular formula bar DOM baseline', () => {
    const formulaBar = renderFormulaBar();

    expect(formulaBar.root.classList.contains('lyra-sheet-formula-bar')).toBe(
      true,
    );
    expect(
      formulaBar.root.querySelector('.lyra-sheet-formula-bar-label'),
    ).toBe(formulaBar.label);
    expect(
      formulaBar.root.querySelector('.lyra-sheet-formula-bar-fx')?.textContent,
    ).toBe('fx');
    expect(
      formulaBar.root.querySelector(
        '.lyra-sheet-formula-bar-input[contenteditable="true"]',
      ),
    ).toBe(formulaBar.textarea);
    expect(formulaBar.root.querySelectorAll('.lyra-sheet-divider.vertical')).toHaveLength(
      2,
    );
  });
});
