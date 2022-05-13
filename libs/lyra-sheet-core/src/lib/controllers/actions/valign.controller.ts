import { Lifecycle, scoped } from 'tsyringe';
import { Subject } from 'rxjs';
import type { TextValignDir } from '../../types';
import { DataService, HistoryService } from '../../services';

@scoped(Lifecycle.ContainerScoped)
export class ValignController {
  currentDir$ = new Subject<TextValignDir>();

  constructor(
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  onInit() {
    this.dataService.selectorChanged$.subscribe((selectors) => {
      if (selectors.length === 0) {
        this.currentDir$.next('bottom');
      } else {
        const [ci, ri] = selectors[0].startCord;
        const cell = this.dataService.selectedSheet.getCell(ri, ci);
        this.currentDir$.next(cell?.style?.valign || 'bottom');
      }
    });
  }

  applyTextValign(dir: TextValignDir): void {
    this.historyService.stacked(() => {
      for (const st of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.applyTextValignTo(st.range, dir);
      }
    });
    this.dataService.rerender();
    this.currentDir$.next(dir);
  }
}
