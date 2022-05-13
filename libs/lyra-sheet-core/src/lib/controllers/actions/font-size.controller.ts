import { Lifecycle, scoped } from 'tsyringe';
import {
  DataService,
  FocusedStyleService,
  HistoryService,
  TextInputService,
} from '../../services';
import { merge, fromEvent, Subject } from 'rxjs';
import { ALL_FONT_SIZE, DEFAULT_FONT_SIZE, getPtByPx } from '../../constants';
import type { FontSizeMenu } from '../../types';

@scoped(Lifecycle.ContainerScoped)
export class FontSizeController {
  curFontSize$ = new Subject<number>();
  menus$ = new Subject<FontSizeMenu[]>();

  constructor(
    private focusedStyleService: FocusedStyleService,
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  onInit() {
    merge(
      fromEvent(document, 'selectionchange'),
      this.dataService.selectorChanged$,
    ).subscribe(() => {
      const pxSize =
        this.focusedStyleService.hitStyle().fontSize || DEFAULT_FONT_SIZE;
      this.notifyChange(getPtByPx(pxSize));
    });
  }

  applyFontSize(option: { pt: number; px: number }): void {
    if (this.textInputService.isEditing) {
      document.execCommand('fontSize', false, '1');
      const spans = document
        .querySelector('.lyra-sheet-rich-text-input-area')!
        .querySelectorAll('span');
      spans.forEach((span) => {
        if (span.style.fontSize === 'x-small') {
          span.style.fontSize = `${option.px}px`;
        }
      });
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.dataService.selectedSheet.selectors) {
          this.dataService.selectedSheet.applyTextSizeTo(
            selector.range,
            option.px,
          );
        }
      });
      this.dataService.rerender();
    }
    this.notifyChange(option.pt);
  }

  private notifyChange(ptSize: number) {
    this.curFontSize$.next(ptSize);
    this.menus$.next(this.buildMenus(ptSize));
  }

  private buildMenus(ptSize: number): FontSizeMenu[] {
    return ALL_FONT_SIZE.map((item) => ({
      pt: item.pt,
      px: item.px,
      checked: item.pt === ptSize,
    }));
  }
}
