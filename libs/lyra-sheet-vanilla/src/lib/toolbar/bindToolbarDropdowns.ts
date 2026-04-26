import {
  AlignController,
  BgColorController,
  BorderController,
  BorderSelection,
  FontColorController,
  FontFamilyController,
  FontSizeController,
  FormatController,
  FormulaController,
  FormulaNames,
  TextAlignDir,
  TextValignDir,
  TextWrapController,
  TextWrapType,
  ValignController,
  CellFormat,
} from '@lyra-sheet/core';
import { DependencyContainer } from 'tsyringe';
import { AngularParityToolbarAction } from '../parity/angularParity';

type DropdownOptionEvent = MouseEvent & {
  currentTarget: HTMLElement;
};

export function bindToolbarDropdowns(
  toolbar: HTMLElement,
  container: DependencyContainer,
): () => void {
  const onToolbarClick = (evt: MouseEvent) => {
    const actionEl = (evt.target as HTMLElement).closest<HTMLElement>(
      '[data-lyra-action]',
    );
    if (!actionEl || !toolbar.contains(actionEl)) {
      return;
    }

    const menu = actionEl.querySelector<HTMLElement>(
      '.lyra-sheet-dropdown-menu',
    );
    if (!menu) {
      return;
    }

    evt.stopPropagation();
    const shouldOpen = menu.hidden;
    closeAllDropdowns(toolbar);
    menu.hidden = !shouldOpen;
  };
  const onDocumentClick = () => closeAllDropdowns(toolbar);
  const optionCleanups = bindDropdownOptions(toolbar, container);

  toolbar.addEventListener('click', onToolbarClick);
  document.addEventListener('click', onDocumentClick);

  return () => {
    toolbar.removeEventListener('click', onToolbarClick);
    document.removeEventListener('click', onDocumentClick);
    optionCleanups.forEach((cleanup) => cleanup());
  };
}

function bindDropdownOptions(
  toolbar: HTMLElement,
  container: DependencyContainer,
): Array<() => void> {
  return Array.from(
    toolbar.querySelectorAll<HTMLElement>('[data-lyra-dropdown-value]'),
  ).map((optionEl) => {
    const listener = (evt: Event) => {
      evt.stopPropagation();
      const optionEvent = evt as DropdownOptionEvent;
      const action = optionEvent.currentTarget
        .closest<HTMLElement>('[data-lyra-action]')
        ?.dataset['lyraAction'] as AngularParityToolbarAction | undefined;
      const value = optionEvent.currentTarget.dataset['lyraDropdownValue'];
      if (!action || value === undefined) {
        return;
      }

      applyDropdownAction(action, value, container);
      closeAllDropdowns(toolbar);
    };

    optionEl.addEventListener('click', listener);
    return () => optionEl.removeEventListener('click', listener);
  });
}

function closeAllDropdowns(toolbar: HTMLElement): void {
  toolbar
    .querySelectorAll<HTMLElement>('.lyra-sheet-dropdown-menu')
    .forEach((menu) => {
      menu.hidden = true;
    });
}

function applyDropdownAction(
  action: AngularParityToolbarAction,
  value: string,
  container: DependencyContainer,
): void {
  switch (action) {
    case 'format':
      container
        .resolve(FormatController)
        .applyFormat((value || undefined) as CellFormat);
      return;
    case 'font-family':
      container.resolve(FontFamilyController).applyFontFamily(value);
      return;
    case 'font-size':
      container.resolve(FontSizeController).applyFontSize(parseFontSize(value));
      return;
    case 'font-color':
      container.resolve(FontColorController).applyTextColor(value);
      return;
    case 'background-color':
      container.resolve(BgColorController).applyBgColor(value);
      return;
    case 'border':
      container.resolve(BorderController).applyBorder(value as BorderSelection);
      return;
    case 'align':
      container.resolve(AlignController).applyTextAlign(value as TextAlignDir);
      return;
    case 'valign':
      container
        .resolve(ValignController)
        .applyTextValign(value as TextValignDir);
      return;
    case 'text-wrap':
      container.resolve(TextWrapController).applyTextWrap(value as TextWrapType);
      return;
    case 'formula':
      container.resolve(FormulaController).applyFormula(value as FormulaNames);
      return;
  }
}

function parseFontSize(value: string): { pt: number; px: number } {
  const [pt, px] = value.split(':').map(Number);
  return { pt, px };
}
