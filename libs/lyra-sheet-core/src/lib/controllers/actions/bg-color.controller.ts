import { Lifecycle, scoped } from 'tsyringe';
import { DataService, HistoryService, TextInputService } from '../../services';

@scoped(Lifecycle.ContainerScoped)
export class BgColorController {
  constructor(
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  applyBgColor(color: string): void {
    if (this.dataService.selectedSheet.selectors.length === 0) {
      return;
    }
    this.historyService.stacked(() => {
      for (const st of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.applyBgColorTo(st.range, color);
      }
    });
    this.dataService.rerender();
  }
}
