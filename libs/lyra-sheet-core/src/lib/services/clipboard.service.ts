import { Lifecycle, scoped } from 'tsyringe';
import { DataService } from './data.service';
import { HistoryService } from './history.service';

@scoped(Lifecycle.ContainerScoped)
export class ClipboardService {
  constructor(
    private dataService: DataService,
    private historyService: HistoryService,
  ) {}

  parseTsv(text: string): string[][] {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((row) => row.split('\t'));
  }

  pasteTsv(text: string): void {
    const selectedSheet = this.dataService.selectedSheet;
    const selector = selectedSheet.selectors[selectedSheet.selectors.length - 1];
    if (!selector) {
      return;
    }

    const matrix = this.parseTsv(text);
    const { sri, sci } = selector.range;

    this.historyService.stacked(
      () => {
        matrix.forEach((row, rowOffset) => {
          row.forEach((value, colOffset) => {
            selectedSheet.applyRichTextToCell(sri + rowOffset, sci + colOffset, [
              [{ text: value }],
            ]);
          });
        });
      },
      {
        si: this.dataService.selectedIndex,
        ri: sri,
        ci: sci,
      },
    );
    this.dataService.rerender();
  }
}
