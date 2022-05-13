import { Data } from '../types';
import { DataService } from './data.service';
import { isNil } from '../utils';
import { Lifecycle, scoped } from 'tsyringe';

interface StackItem {
  si: number;
  ci: number;
  ri: number;
  d: string; // json string
}

interface StackOption {
  si?: number; // sheet index
  ci?: number; // column index
  ri?: number; // row index
}

@scoped(Lifecycle.ContainerScoped)
export class HistoryService {
  private stack: StackItem[] = [];
  private cursor!: number;

  constructor(private dataService: DataService) {}

  get canUndo(): boolean {
    return this.cursor > 0;
  }

  get canRedo(): boolean {
    return this.cursor !== this.stack.length - 1;
  }

  // should call once only, keep in mind
  init(d: Data): void {
    this.stack = [
      {
        si: d.sheets.findIndex((s) => s.selected),
        ci: 0,
        ri: 0,
        d: JSON.stringify(d),
      },
    ];
    this.cursor = 0;
  }

  stacked(op: () => void, option?: StackOption): void {
    const { si, ci, ri } = option || {};
    // get the operated sheet index
    const sheetIndex = isNil(si) ? this.dataService.selectedIndex : si!;
    op();
    let rowIndex = ri;
    let colIndex = ci;
    if (isNil(ri) || isNil(ci)) {
      if (this.dataService.selectedSheet.selectors.length > 0) {
        [colIndex, rowIndex] =
          this.dataService.selectedSheet.selectors[0].startCord;
      }
    }
    // if cursor is at last, just push
    // if not, remove all snapshot after cursor and then push
    const len = this.stack.length;
    this.cursor += 1;
    this.stack.splice(this.cursor, len - this.cursor, {
      si: sheetIndex,
      ri: rowIndex || 0,
      ci: colIndex || 0,
      d: JSON.stringify(this.dataService.snapshot),
    });
    this.dataService.notifyDataChange();
  }

  undo(): void {
    if (this.canUndo) {
      const sheetIndexWhichWillBeUndo = this.stack[this.cursor].si;
      this.cursor -= 1;
      const d = JSON.parse(this.stack[this.cursor].d) as Data;
      d.sheets.forEach((s, i) =>
        i === sheetIndexWhichWillBeUndo
          ? (s.selected = true)
          : (s.selected = false),
      );
      this.dataService.loadData(d);
      this.dataService.rerender();
      this.dataService.notifyDataChange();
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.cursor += 1;
      this.dataService.loadData(JSON.parse(this.stack[this.cursor].d));
      this.dataService.rerender();
      this.dataService.notifyDataChange();
    }
  }
}
