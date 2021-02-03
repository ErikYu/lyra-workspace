import { Inject } from '@angular/core';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { Merge } from '../ngx-datasheet.model';
import { Rect } from '../models';

export type MergesServiceFactory = (merges: Merge[]) => MergesService;

export class MergesService {
  private ranges: CellRange[] = [];

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
