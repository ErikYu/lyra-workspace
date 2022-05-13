import { Lifecycle, scoped } from 'tsyringe';
import { DataService, HistoryService } from '../../services';
import { isNil, isNumber } from '../../utils';

@scoped(Lifecycle.ContainerScoped)
export class DecimalController {
  constructor(
    private dataService: DataService,
    private historyService: HistoryService,
  ) {}

  execute(tpe: 'add' | 'reduce') {
    if (this.dataService.selectedSheet.selectors.length === 0) {
      return;
    }
    const [ci, ri] = this.dataService.selectedSheet.selectors[0].startCord;
    const startCell = this.dataService.selectedSheet.getCell(ri, ci);
    const startCellText = this.dataService.selectedSheet.getCellPlainText(
      ri,
      ci,
    );
    if (!isNumber(startCellText)) {
      return;
    }
    const oldPrecision = isNil(startCell?.style?.precision)
      ? startCellText?.split('.')[1]?.length || 0
      : startCell!.style!.precision!;
    const step = tpe === 'add' ? 1 : -1;
    const newPrecision = oldPrecision + step;
    if (newPrecision < 0) {
      return;
    }
    this.historyService.stacked(() => {
      for (const selector of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.applyPrecisionTo(
          selector.range,
          newPrecision,
        );
      }
    });
    this.dataService.rerender();
  }
}
