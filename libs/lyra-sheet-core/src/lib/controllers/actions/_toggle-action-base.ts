import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import {
  CellRange,
  DataService,
  FocusedStyleService,
  HistoryService,
  TextInputService,
} from '../../services';

export abstract class ToggleActionBase {
  value$ = new BehaviorSubject(false);

  focusedStyleService!: FocusedStyleService;
  textInputService!: TextInputService;
  historyService!: HistoryService;
  dataService!: DataService;

  protected constructor(
    private styleAttr: 'italic' | 'bold' | 'strike' | 'underline',
  ) {}

  onInit() {
    merge(
      fromEvent(document, 'selectionchange'),
      this.dataService.selectorChanged$,
    ).subscribe(() => {
      this.value$.next(
        this.focusedStyleService.hitStyle()[this.styleAttr] || false,
      );
    });
  }

  toggle() {
    if (this.textInputService.isEditing) {
      document.execCommand(this.styleAttr, false);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.dataService.selectedSheet.selectors) {
          const args: [CellRange, boolean] = [
            selector.range,
            !this.value$.value,
          ];
          switch (this.styleAttr) {
            case 'bold':
              this.dataService.selectedSheet.applyTextBoldTo(...args);
              break;
            case 'italic':
              this.dataService.selectedSheet.applyTextItalicTo(...args);
              break;
            case 'strike':
              this.dataService.selectedSheet.applyTextStrikeTo(...args);
              break;
            case 'underline':
              this.dataService.selectedSheet.applyTextUnderlineTo(...args);
              break;
            default:
              throw Error(`${this.styleAttr} not found!`);
          }
        }
      });
      this.dataService.rerender();
    }
    this.value$.next(!this.value$.value);
  }
}
