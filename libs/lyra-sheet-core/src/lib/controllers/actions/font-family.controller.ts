import { Lifecycle, scoped } from 'tsyringe';
import {
  DataService,
  FocusedStyleService,
  HistoryService,
  TextInputService,
} from '../../services';
import { fromEvent, combineLatest, merge, Subject } from 'rxjs';
import { ALL_FONT_FAMILY, DEFAULT_FONT_FAMILY } from '../../constants';

interface FFMenu {
  label: string;
  checked: boolean;
}

@scoped(Lifecycle.ContainerScoped)
export class FontFamilyController {
  fontFamily$ = new Subject<string>();
  allFontFamilies$ = new Subject<FFMenu[]>();

  constructor(
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private dataService: DataService,
    private focusedStyleService: FocusedStyleService,
  ) {}

  onInit() {
    merge(
      fromEvent(document, 'selectionchange'),
      this.dataService.selectorChanged$,
    ).subscribe(() => {
      const ff =
        this.focusedStyleService.hitStyle().fontName || DEFAULT_FONT_FAMILY;
      this.fontFamily$.next(ff);
      this.allFontFamilies$.next(this.buildMenus(ff));
    });
  }

  applyFontFamily(ff: string): void {
    if (this.textInputService.isEditing) {
      document.execCommand('fontName', false, ff);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.dataService.selectedSheet.selectors) {
          this.dataService.selectedSheet.applyTextFontFamilyTo(
            selector.range,
            ff,
          );
        }
      });
      this.dataService.rerender();
    }
    this.fontFamily$.next(ff);
    this.allFontFamilies$.next(this.buildMenus(ff));
  }

  private buildMenus(ff: string): FFMenu[] {
    return ALL_FONT_FAMILY.map((f) => ({
      label: f,
      checked: f == ff,
    }));
  }
}
