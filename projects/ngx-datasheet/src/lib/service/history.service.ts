import { Injectable } from '@angular/core';
import { NDData } from '../ngx-datasheet.model';
import { DataService } from '../core/data.service';
import { SelectorsService } from '../core/selectors.service';
import { isNil } from '../utils';

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

@Injectable()
export class HistoryService {
  private stack: StackItem[] = [];
  private cursor!: number;

  constructor(
    private dataService: DataService,
    private selectorsService: SelectorsService,
  ) {}

  get canUndo(): boolean {
    return this.cursor > 0;
  }

  get canRedo(): boolean {
    return this.cursor !== this.stack.length - 1;
  }

  // should call once only, keep in mind
  init(d: NDData): void {
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

  stacked(op: () => any, option?: StackOption): void {
    const { si, ci, ri } = option || {};
    // get the operated sheet index
    const sheetIndex = isNil(si) ? this.dataService.selectedIndex : si!;
    op();
    let rowIndex = ri;
    let colIndex = ci;
    if (isNil(ri) || isNil(ci)) {
      if (this.selectorsService.selectors.length > 0) {
        [rowIndex, colIndex] = this.selectorsService.selectors[0].startCord;
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
  }

  undo(): void {
    if (this.canUndo) {
      const sheetIndexWhichWillBeUndo = this.stack[this.cursor].si;
      this.cursor -= 1;
      const d = JSON.parse(this.stack[this.cursor].d) as NDData;
      d.sheets.forEach((s, i) =>
        i === sheetIndexWhichWillBeUndo
          ? (s.selected = true)
          : (s.selected = false),
      );
      this.dataService.loadData(d);
      this.dataService.rerender();
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.cursor += 1;
      this.dataService.loadData(JSON.parse(this.stack[this.cursor].d));
      this.dataService.rerender();
    }
  }
}
