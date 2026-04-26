import 'reflect-metadata';
import {
  AlignController,
  FontFamilyController,
  FormatController,
  FormulaController,
  TextWrapController,
} from '@lyra-sheet/core';
import { DependencyContainer } from 'tsyringe';
import { renderToolbar } from '../dom/renderToolbar';
import { bindToolbarDropdowns } from './bindToolbarDropdowns';

describe('bindToolbarDropdowns', () => {
  let formatController: { applyFormat: jest.Mock };
  let fontFamilyController: { applyFontFamily: jest.Mock };
  let alignController: { applyTextAlign: jest.Mock };
  let textWrapController: { applyTextWrap: jest.Mock };
  let formulaController: { applyFormula: jest.Mock };
  let container: Pick<DependencyContainer, 'resolve'>;
  let toolbar: HTMLElement;

  beforeEach(() => {
    formatController = { applyFormat: jest.fn() };
    fontFamilyController = { applyFontFamily: jest.fn() };
    alignController = { applyTextAlign: jest.fn() };
    textWrapController = { applyTextWrap: jest.fn() };
    formulaController = { applyFormula: jest.fn() };

    const tokenMap = new Map<unknown, unknown>([
      [FormatController, formatController],
      [FontFamilyController, fontFamilyController],
      [AlignController, alignController],
      [TextWrapController, textWrapController],
      [FormulaController, formulaController],
    ]);
    container = {
      resolve: jest.fn((token: unknown) => tokenMap.get(token)),
    } as Pick<DependencyContainer, 'resolve'>;
    toolbar = renderToolbar(container as DependencyContainer);
    bindToolbarDropdowns(toolbar, container as DependencyContainer);
  });

  it('opens one dropdown at a time and closes it from the document', () => {
    clickAction('format');

    expect(menu('format').hidden).toBe(false);

    clickAction('font-family');

    expect(menu('format').hidden).toBe(true);
    expect(menu('font-family').hidden).toBe(false);

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(menu('font-family').hidden).toBe(true);
  });

  it('applies dropdown options through core controllers', () => {
    clickAction('format');
    clickOption('format', 'percent');
    clickAction('font-family');
    clickOption('font-family', 'Georgia');
    clickAction('align');
    clickOption('align', 'center');
    clickAction('text-wrap');
    clickOption('text-wrap', 'wrap');
    clickAction('formula');
    clickOption('formula', 'SUM');

    expect(formatController.applyFormat).toHaveBeenCalledWith('percent');
    expect(fontFamilyController.applyFontFamily).toHaveBeenCalledWith('Georgia');
    expect(alignController.applyTextAlign).toHaveBeenCalledWith('center');
    expect(textWrapController.applyTextWrap).toHaveBeenCalledWith('wrap');
    expect(formulaController.applyFormula).toHaveBeenCalledWith('SUM');
    expect(menu('formula').hidden).toBe(true);
  });

  it('returns cleanup for dropdown listeners', () => {
    const secondToolbar = renderToolbar(container as DependencyContainer);
    const cleanup = bindToolbarDropdowns(
      secondToolbar,
      container as DependencyContainer,
    );

    cleanup();
    secondToolbar
      .querySelector('[data-lyra-action="format"]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(
      (
        secondToolbar.querySelector(
          '[data-lyra-action="format"] .lyra-sheet-dropdown-menu',
        ) as HTMLElement
      ).hidden,
    ).toBe(true);
  });

  function clickAction(action: string): void {
    toolbar
      .querySelector(`[data-lyra-action="${action}"]`)!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  function clickOption(action: string, value: string): void {
    toolbar
      .querySelector(
        `[data-lyra-action="${action}"] [data-lyra-dropdown-value="${value}"]`,
      )!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  function menu(action: string): HTMLElement {
    return toolbar.querySelector(
      `[data-lyra-action="${action}"] .lyra-sheet-dropdown-menu`,
    ) as HTMLElement;
  }
});
