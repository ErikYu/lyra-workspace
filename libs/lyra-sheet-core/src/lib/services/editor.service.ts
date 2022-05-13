import { Lifecycle, scoped } from 'tsyringe';
import { ScrollingService } from './scrolling.service';
import { DataService } from './data.service';

@scoped(Lifecycle.ContainerScoped)
export class EditorService {
  constructor(
    private scrollingService: ScrollingService,
    private dataService: DataService,
  ) {}

  // when scroll on mask
  // calc next row's height or column's width
  // the value will be used to move vScrollbar/hScrollbar programally
  calcNextStepDelta(evt: WheelEvent): { hDelta?: number; vDelta?: number } {
    const { deltaX, deltaY } = evt;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0) {
        // sheet going down
        const nextRi = this.scrollingService.rowIndex + 1;
        if (nextRi < this.dataService.selectedSheet.getRowCount()) {
          const scrollHeight = this.scrollToNextRow(nextRi);
          return { vDelta: scrollHeight };
        }
        return {};
      } else {
        // sheet going up
        const nextRi = this.scrollingService.rowIndex - 1;
        if (nextRi >= 0) {
          const scrollHeight = this.scrollToNextRow(nextRi);
          return { vDelta: -scrollHeight };
        }
        return { vDelta: 0 };
      }
    } else {
      if (deltaX > 0) {
        // sheet going right
        const nextCi = this.scrollingService.colIndex + 1;
        if (nextCi < this.dataService.selectedSheet.getColCount()) {
          const scrollWidth = this.scrollToNextCol(nextCi);
          return { hDelta: scrollWidth };
        }
        return {};
      } else {
        // sheet going right
        const nextCi = this.scrollingService.colIndex - 1;
        if (nextCi >= 0) {
          const scrollWidth = this.scrollToNextCol(nextCi);
          return { hDelta: -scrollWidth };
        }
        return { hDelta: 0 };
      }
    }
  }

  private scrollToNextRow(startFrom: number): number {
    let i = startFrom;
    let rowHeight = 0;
    // when next row is hidden
    // should go next next
    do {
      rowHeight = this.dataService.selectedSheet.getRowHeight(i);
      i += 1;
    } while (rowHeight === 0);
    return rowHeight;
  }

  private scrollToNextCol(startFrom: number): number {
    let i = startFrom;
    let colWidth = 0;
    // when next row is hidden
    // should go next next
    do {
      colWidth = this.dataService.selectedSheet.getColWidth(i);
      i += 1;
    } while (colWidth === 0);
    return colWidth;
  }
}
