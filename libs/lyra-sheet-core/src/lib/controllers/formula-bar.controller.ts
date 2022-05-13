import { Lifecycle, scoped } from 'tsyringe';
import { fromEvent, merge, Subject } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { labelFromCell } from '../utils';
import {
  DataService,
  RichTextToHtmlService,
  TextInputService,
} from '../services';

@scoped(Lifecycle.ContainerScoped)
export class FormulaBarController {
  textareaEl!: HTMLDivElement;
  label$ = new Subject<string>();
  constructor(
    private dataService: DataService,
    private richTextToHtmlService: RichTextToHtmlService,
    private textInputService: TextInputService,
  ) {}

  mount(el: HTMLDivElement) {
    this.textareaEl = el;
    const causedBySelector = this.dataService.selectorChanged$.pipe(
      filter((selectors) => Array.isArray(selectors) && selectors.length > 0),
      map((selectors) => {
        const last = selectors[selectors.length - 1];
        const { sri, sci, eri, eci } = last.range;
        if (last.range.isSingleCell) {
          this.label$.next(labelFromCell(sri, sci));
        } else {
          this.label$.next(
            `${labelFromCell(sri, sci)}:${labelFromCell(eri, eci)}`,
          );
        }
        return last;
      }),
      map((lastSelector) => {
        const [hitCi, hitRi] = lastSelector.startCord;
        const richText = this.dataService.selectedSheet.getCell(
          hitRi,
          hitCi,
        )?.richText;
        return this.richTextToHtmlService.conv(richText);
      }),
    );
    const htmlShouldChange = merge(
      causedBySelector,
      this.textInputService.htmlForFormulaBar$,
    );
    htmlShouldChange.subscribe((html) => {
      this.textareaEl.innerHTML = html;
      this.textInputService.focus();
    });

    const textarea = this.textareaEl;
    fromEvent(textarea, 'focusin')
      .pipe(
        tap(() => this.textInputService.show(false)),
        switchMap(() => fromEvent(textarea, 'input')),
      )
      .subscribe(() => {
        this.textInputService.transferFromFormulaBar(textarea.innerHTML);
      });
  }
}
