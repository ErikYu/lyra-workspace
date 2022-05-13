import { Lifecycle, scoped } from 'tsyringe';
import { BehaviorSubject } from 'rxjs';
import { DataService, HistoryService } from '../../services';

@scoped(Lifecycle.ContainerScoped)
export class MergeController {
  hasMerge$ = new BehaviorSubject<boolean>(false);

  constructor(
    private dataService: DataService,
    private historyService: HistoryService,
  ) {}

  onInit() {
    this.dataService.selectorChanged$.subscribe((selectors) => {
      if (selectors.length === 0) {
        this.hasMerge$.next(false);
      } else {
        this.hasMerge$.next(
          this.dataService.selectedSheet.merges.overlappingWith(
            selectors[0].range,
          ),
        );
      }
    });
  }

  applyMerge() {
    if (this.dataService.selectedSheet.selectors.length > 0) {
      this.historyService.stacked(() => {
        if (!this.hasMerge$.value) {
          this.dataService.selectedSheet.applyMergeTo(
            this.dataService.selectedSheet.selectors[0].range,
          );
          this.hasMerge$.next(true);
        } else {
          this.dataService.selectedSheet.removeMergesInside(
            this.dataService.selectedSheet.selectors[0].range,
          );
          this.hasMerge$.next(false);
        }
      });
      this.dataService.rerender();
    }
  }
}
