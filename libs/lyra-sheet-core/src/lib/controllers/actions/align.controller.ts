import { Lifecycle, scoped } from 'tsyringe';
import type { TextAlignDir } from '../../types';
import { DataService, HistoryService } from '../../services';
import { Subject } from 'rxjs';

@scoped(Lifecycle.ContainerScoped)
export class AlignController {
  currentDir$ = new Subject<TextAlignDir>();
  constructor(
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  onInit() {
    this.dataService.selectorChanged$.subscribe((selectors) => {
      if (selectors.length === 0) {
        this.currentDir$.next('left');
      } else {
        const [ci, ri] = selectors[0].startCord;
        const cell = this.dataService.selectedSheet.getCell(ri, ci);
        this.currentDir$.next(cell?.style?.align || 'left');
      }
    });
  }

  applyTextAlign(dir: TextAlignDir): void {
    this.historyService.stacked(() => {
      for (const st of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.applyTextAlignTo(st.range, dir);
      }
    });
    this.dataService.rerender();
    this.currentDir$.next(dir);
  }
}
