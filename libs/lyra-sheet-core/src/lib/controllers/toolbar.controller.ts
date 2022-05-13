import { Lifecycle, scoped } from 'tsyringe';
import { DataService, HistoryService } from '../services';

@scoped(Lifecycle.ContainerScoped)
export class ToolbarController {
  constructor(
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  applyPercentage() {
    this.historyService.stacked(() => {
      for (const selector of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.dataService.selectedSheet.applyCellFormatTo(
          selector.range,
          'percent',
        );
      }
    });
    this.dataService.rerender();
  }

  applyCurrency() {
    this.historyService.stacked(() => {
      for (const selector of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.dataService.selectedSheet.applyCellFormatTo(
          selector.range,
          'currency',
        );
      }
    });
    this.dataService.rerender();
  }
}
