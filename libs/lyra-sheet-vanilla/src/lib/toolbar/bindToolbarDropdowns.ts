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
import { Subscription } from 'rxjs';
import { DependencyContainer } from 'tsyringe';
import { AngularParityToolbarAction } from '../parity/angularParity';

type DropdownOptionEvent = MouseEvent & {
  currentTarget: HTMLElement;
};

export function bindToolbarDropdowns(
  toolbar: HTMLElement,
  container: DependencyContainer,
): () => void {
  const subscriptions = new Subscription();
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
  bindDropdownDisplay(toolbar, container, subscriptions);

  toolbar.addEventListener('click', onToolbarClick);
  document.addEventListener('click', onDocumentClick);

  return () => {
    toolbar.removeEventListener('click', onToolbarClick);
    document.removeEventListener('click', onDocumentClick);
    optionCleanups.forEach((cleanup) => cleanup());
    subscriptions.unsubscribe();
  };
}

function bindDropdownDisplay(
  toolbar: HTMLElement,
  container: DependencyContainer,
  subscriptions: Subscription,
): void {
  const formatController = container.resolve(FormatController);
  const fontFamilyController = container.resolve(FontFamilyController);
  const fontSizeController = container.resolve(FontSizeController);

  formatController.onInit();
  fontFamilyController.onInit();
  fontSizeController.onInit();

  subscriptions.add(
    formatController.controlDisplayLabel$.subscribe((label) => {
      setToolbarLabel(toolbar, 'format', label || 'Auto');
    }),
  );
  subscriptions.add(
    fontFamilyController.fontFamily$.subscribe((fontFamily) => {
      setToolbarLabel(toolbar, 'font-family', fontFamily || 'Arial');
    }),
  );
  subscriptions.add(
    fontSizeController.curFontSize$.subscribe((ptSize) => {
      if (!Number.isFinite(ptSize)) {
        return;
      }
      setToolbarLabel(toolbar, 'font-size', String(ptSize));
    }),
  );
}

function setToolbarLabel(
  toolbar: HTMLElement,
  action: 'format' | 'font-family' | 'font-size',
  label: string,
): void {
  const labelEl = toolbar.querySelector<HTMLElement>(
    `[data-lyra-action="${action}"] .lyra-sheet-toolbar-label`,
  );
  if (!labelEl) {
    return;
  }
  labelEl.textContent = label;
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
