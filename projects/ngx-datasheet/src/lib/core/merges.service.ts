import { Inject } from '@angular/core';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { Merge } from '../ngx-datasheet.model';
import { Rect } from '../models';

export type MergesServiceFactory = (merges: Merge[]) => MergesService;

export class MergesService {
  private ranges: CellRange[] = [];

  get snapshot(): Merge[] {
    return this.ranges.map(({ sri, sci, eri, eci }) => [
      [sri, sci],
      [eri, eci],
    ]);
  }

  constructor(
    merges: Merge[],
    @Inject(CellRange) private cellRangeFactory: CellRangeFactory,
  ) {
    this.ranges = merges.map(([[sri, sci], [eri, eci]]) =>
      cellRangeFactory(sri, eri, sci, eci),
    );
  }

  removeMerge(range: CellRange): void {
    this.ranges = this.ranges.filter((rg) => !rg.equals(range));
  }

  addMerge(range: CellRange): void {
    this.ranges.push(range);
  }

  moveOrExpandByRow(
    ri: number,
    count: number,
    leftTopUpdater: (sri: number, sci: number) => void,
  ): void {
    this.ranges = this.ranges.map((range) => {
      const { sri, sci, eri, eci } = range;
      if (ri <= sri) {
        // shift merge data
        return this.cellRangeFactory(sri + count, eri + count, sci, eci);
      } else if (ri <= eri) {
        // expand merge data
        leftTopUpdater(sri, sci);
        return this.cellRangeFactory(sri, eri + count, sci, eci);
      }
      return range;
    });
  }

  moveOrExpandByCol(
    ci: number,
    count: number,
    leftTopUpdater: (sri: number, sci: number) => void,
  ): void {
    this.ranges = this.ranges.map((range) => {
      const { sri, sci, eri, eci } = range;
      if (ci <= sci) {
        // shift merge data
        return this.cellRangeFactory(sri, eri, sci + count, eci + count);
      } else if (ci <= eri) {
        // expand merge data
        leftTopUpdater(sri, sci);
        return this.cellRangeFactory(sri, eri, sci, eci + count);
      }
      return range;
    });
  }

  overlappingWith(cellRange: CellRange): boolean {
    for (const range of this.ranges) {
      if (range.overlappingWithRange(cellRange)) {
        return true;
      }
    }
    return false;
  }

  overlappedMergesBy(rect: Rect): CellRange[] {
    return this.ranges.filter((i) => i.overlappingWithRange(rect));
  }

  getHitMerge(ri: number, ci: number): CellRange | null {
    for (const range of this.ranges) {
      if (range.overlappingWithCell(ri, ci)) {
        return range;
      }
    }
    return null;
  }
}
