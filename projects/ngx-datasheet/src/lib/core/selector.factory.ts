import { CellRange, CellRangeFactory } from './cell-range.factory';
import { Inject } from '@angular/core';
import { Cord } from './canvas.service';
import { Rect } from '../models';

export type SelectorFactory = (
  sri: number,
  eri: number,
  sci: number,
  eci: number,
) => Selector;

export class Selector {
  range!: CellRange;

  get startCord(): Cord {
    return [this.ri, this.ci];
  }

  // init coordinate
  private readonly ri!: number;
  private readonly ci!: number;
  constructor(
    sri: number,
    eri: number,
    sci: number,
    eci: number,
    @Inject(CellRange) private cellRangeFactory: CellRangeFactory,
  ) {
    this.ri = sri;
    this.ci = sci;
    this.range = cellRangeFactory(sri, eri, sci, eci);
  }

  endResizeTo(targetRowIndex: number, targetColIndex: number): void {
    if (targetRowIndex > this.ri) {
      this.range.eri = targetRowIndex;
    } else if (targetRowIndex < this.ri) {
      this.range.sri = targetRowIndex;
    } else {
      this.range.sri = targetRowIndex;
      this.range.eri = targetRowIndex;
    }

    if (targetColIndex > this.ci) {
      this.range.eci = targetColIndex;
    } else if (targetColIndex < this.ci) {
      this.range.sci = targetColIndex;
    } else {
      this.range.sci = targetColIndex;
      this.range.eci = targetColIndex;
    }
  }

  resizeTo(rect: Rect): void {
    this.range.sri = rect.sri;
    this.range.sci = rect.sci;
    this.range.eri = rect.eri;
    this.range.eci = rect.eci;
  }
}
