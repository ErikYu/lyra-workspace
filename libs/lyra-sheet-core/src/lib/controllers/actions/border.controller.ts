import { Lifecycle, scoped } from 'tsyringe';
import type { BorderSelection } from '../../services';
import { DataService, HistoryService, Selector } from '../../services';
import type { BorderType } from '../../types';
import { BehaviorSubject } from 'rxjs';

@scoped(Lifecycle.ContainerScoped)
export class BorderController {
  defaultBorderType$ = new BehaviorSubject<BorderType>('thin');
  defaultBorderColor$ = new BehaviorSubject('#000000');
  constructor(
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  applyBorder(type: BorderSelection) {
    this.historyService.stacked(() => {
      this.dataService.selectedSheet.selectors.forEach((st: Selector) => {
        this.dataService.selectedSheet.applyBorderTo(
          st.range,
          type,
          this.defaultBorderType$.value,
          this.defaultBorderColor$.value,
        );
      });
    });
    this.dataService.rerender();
  }

  onSelectType(borderType: BorderType): void {
    this.defaultBorderType$.next(borderType);
  }

  onSelectColor(color: string): void {
    this.defaultBorderColor$.next(color);
  }
}
