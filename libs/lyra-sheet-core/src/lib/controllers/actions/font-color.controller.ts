import { Lifecycle, scoped } from 'tsyringe';
import {
  DataService,
  FocusedStyleService,
  HistoryService,
  TextInputService,
} from '../../services';
import { fromEvent, Subject, merge } from 'rxjs';
import { DEFAULT_FONT_COLOR } from '../../constants';

@scoped(Lifecycle.ContainerScoped)
export class FontColorController {
  curColor$ = new Subject<string>();

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
      const color =
        this.focusedStyleService.hitStyle().color || DEFAULT_FONT_COLOR;
      this.curColor$.next(color);
    });
  }

  applyTextColor(color: string): void {
    if (this.textInputService.isEditing) {
      document.execCommand('foreColor', false, color);
    } else {
      this.historyService.stacked(() => {
        for (const st of this.dataService.selectedSheet.selectors) {
          this.dataService.selectedSheet.applyTextColorTo(st.range, color);
        }
      });
      this.dataService.rerender();
    }
    this.curColor$.next(color);
  }
}
