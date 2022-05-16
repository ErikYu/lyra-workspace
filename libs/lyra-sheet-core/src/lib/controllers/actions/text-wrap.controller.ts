import { Lifecycle, scoped } from 'tsyringe';
import { Subject } from 'rxjs';
import type { TextWrapType } from '../../types';
import { DataService, HistoryService } from '../../services';

@scoped(Lifecycle.ContainerScoped)
export class TextWrapController {
  currentWrap$ = new Subject<TextWrapType>();
  constructor(
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  onInit() {
    this.dataService.selectorChanged$.subscribe((selectors) => {
      if (selectors.length === 0) {
        this.currentWrap$.next('overflow');
      } else {
        const [ci, ri] = selectors[0].startCord;
        const cell = this.dataService.selectedSheet.getCell(ri, ci);
        this.currentWrap$.next(cell?.style?.textWrap || 'overflow');
      }
    });
  }

  applyTextWrap(type: TextWrapType) {
    this.historyService.stacked(() => {
      this.dataService.selectedSheet.selectors.forEach((st) => {
        this.dataService.selectedSheet.applyTextWrapTo(st.range, type);
      });
    });
    this.dataService.rerender();
    this.currentWrap$.next(type);
  }
}
