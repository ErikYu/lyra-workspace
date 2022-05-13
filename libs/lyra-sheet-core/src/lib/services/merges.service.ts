import { CellRange } from './cell-range.factory';
import type { CellRangeFactory } from './cell-range.factory';
import type { Merge, Rect } from '../types';
import { inject } from 'tsyringe';

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
    @inject(CellRange) private cellRangeFactory: CellRangeFactory,
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
      } else {
        return range;
      }
    });
  }

  moveOrShrinkByRow(
    sri: number,
    eri: number,
    mergeAttrSetter: (
      msri: number,
      msci: number,
      [rowSpan, colSpan]: [number, number],
    ) => void,
  ): void {
    const deleteCount = eri - sri + 1;
    this.ranges = this.ranges.reduce<CellRange[]>((prev, range) => {
      const { sri: msri, sci: msci, eri: meri, eci: meci } = range;
      // 0, 1, 2
      const newRowSpan = Math.max(meri - eri, 0) + Math.max(sri - msri, 0) - 1;
      if (newRowSpan < 0) {
        // just remove this merge directly
        return prev;
      }
      if (eri < msri) {
        // move only
        return [
          ...prev,
          this.cellRangeFactory(
            msri - deleteCount,
            meri - deleteCount,
            msci,
            meci,
          ),
        ];
      } else if (sri <= meri) {
        // move and shrink
        const newSri = Math.min(sri, msri);
        mergeAttrSetter(newSri, msci, [newRowSpan, meci - msci]);
        return [
          ...prev,
          this.cellRangeFactory(newSri, newSri + newRowSpan, msci, meci),
        ];
      } else {
        return [...prev, range];
      }
    }, []);
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

  moveAndShrinkByCol(
    sci: number,
    eci: number,
    mergeAttrSetter: (
      msri: number,
      msci: number,
      [rowSpan, colSpan]: [number, number],
    ) => void,
  ): void {
    const deleteCount = eci - sci + 1;
    this.ranges = this.ranges.reduce<CellRange[]>((prev, range) => {
      const { sri: msri, sci: msci, eri: meri, eci: meci } = range;
      const newColSpan = Math.max(meci - eci, 0) + Math.max(sci - msci, 0) - 1;
      if (newColSpan < 0) {
        // just remove this merge directly
        return prev;
      }
      if (eci < msci) {
        // move only
        return [
          ...prev,
          this.cellRangeFactory(
            msri,
            meri,
            msci - deleteCount,
            meci - deleteCount,
          ),
        ];
      } else if (sci <= meci) {
        // move and shrink
        const newSci = Math.min(sci, msci);
        mergeAttrSetter(msri, newSci, [meri - msri, newColSpan]);
        return [
          ...prev,
          this.cellRangeFactory(msri, meri, newSci, newSci + newColSpan),
        ];
      } else {
        return [...prev, range];
      }
    }, []);
  }

  shiftRight(selectorRange: CellRange, count: number): boolean {
    const res: CellRange[] = [];
    let shouldMove = true;
    for (const range of this.ranges) {
      const { sri, sci, eri, eci } = range;
      if (
        selectorRange.eri < sri ||
        selectorRange.sri > eri ||
        selectorRange.sci > eci
      ) {
        // range do not need to shift
        res.push(range);
      } else if (selectorRange.eri < eri || selectorRange.sri > sri) {
        console.warn('Cannot insert cells like this');
        shouldMove = false;
        break;
      } else {
        res.push(this.cellRangeFactory(sri, eri, sci + count, eci + count));
      }
    }
    if (shouldMove) {
      this.ranges = res;
    }
    return shouldMove;
  }

  shiftLeft(selectorRange: CellRange): boolean {
    const deleteCount = selectorRange.eci - selectorRange.sci + 1;
    const res: CellRange[] = [];
    let shouldMove = true;
    for (const range of this.ranges) {
      const { sri: msri, sci: msci, eri: meri, eci: meci } = range;
      if (
        selectorRange.eri < msri ||
        selectorRange.sri > meri ||
        selectorRange.sci > meci
      ) {
        // range do not need to shift
        res.push(range);
      } else if (selectorRange.eri < meri || selectorRange.sri > msri) {
        console.warn('Cannot delete cells like this');
        shouldMove = false;
        break;
      } else if (
        selectorRange.sri <= msri &&
        selectorRange.eri >= meri &&
        selectorRange.sci <= msci &&
        selectorRange.eci >= meci
      ) {
        // this range will be removed
        continue;
      } else {
        res.push(
          this.cellRangeFactory(
            msri,
            meri,
            msci - deleteCount,
            meci - deleteCount,
          ),
        );
      }
    }
    if (shouldMove) {
      this.ranges = res;
    }
    return shouldMove;
  }

  shiftDown(selectorRange: CellRange, count: number): boolean {
    const res: CellRange[] = [];
    let shouldMove = true;
    for (const range of this.ranges) {
      const { sri: msri, sci: msci, eri: meri, eci: meci } = range;
      if (
        selectorRange.eci < msci ||
        selectorRange.sci > meci ||
        selectorRange.sri > meri
      ) {
        // range do not need to shift
        res.push(range);
      } else if (selectorRange.eci < meci || selectorRange.sci > msci) {
        console.warn('Cannot insert cells like this');
        shouldMove = false;
        break;
      } else {
        res.push(this.cellRangeFactory(msri + count, meri + count, msci, meci));
      }
    }
    if (shouldMove) {
      this.ranges = res;
    }
    return shouldMove;
  }

  shiftTop(selectorRange: CellRange): boolean {
    const deleteCount = selectorRange.eri - selectorRange.sri + 1;
    const res: CellRange[] = [];
    let shouldMove = true;
    for (const range of this.ranges) {
      const { sri: msri, sci: msci, eri: meri, eci: meci } = range;
      if (
        selectorRange.eci < msci ||
        selectorRange.sci > meci ||
        selectorRange.sri > meri
      ) {
        // range do not need to shift
        res.push(range);
      } else if (selectorRange.eci < meci || selectorRange.sci > msci) {
        console.warn('Cannot delete cells like this');
        shouldMove = false;
        break;
      } else if (
        selectorRange.sri <= msri &&
        selectorRange.eri >= meri &&
        selectorRange.sci <= msci &&
        selectorRange.eci >= meci
      ) {
        // this range will be removed
        continue;
      } else {
        res.push(
          this.cellRangeFactory(
            msri - deleteCount,
            meri - deleteCount,
            msci,
            meci,
          ),
        );
      }
    }
    if (shouldMove) {
      this.ranges = res;
    }
    return shouldMove;
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
