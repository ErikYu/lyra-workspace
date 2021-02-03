import { Inject, Injectable } from '@angular/core';
import { ScrollingService } from './scrolling.service';
import { ViewRangeService } from './view-range.service';
import { ConfigService } from './config.service';
import { Selector, SelectorFactory } from './selector.factory';
import { DataService } from './data.service';
import { Rect } from '../models';

interface SelectorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Injectable()
export class SelectorsService {
  selectors: Selector[] = [];

  get rects(): SelectorRect[] {
    const viewRange = this.viewRangeService.getViewRange();

    return this.selectors.map(({ range: cellRange }) => {
      let top = 0;
      let left = 0;
      let height = 0;
      let width = 0;
      if (viewRange.sri <= cellRange.sri) {
        for (let ri = viewRange.sri; ri < cellRange.sri; ri++) {
          top += this.dataService.selectedSheet.getRowHeight(ri);
        }
      } else {
        for (let ri = cellRange.sri; ri < viewRange.sri; ri++) {
          top -= this.dataService.selectedSheet.getRowHeight(ri);
        }
      }
      for (let ri = cellRange.sri; ri <= cellRange.eri; ri++) {
        height += this.dataService.selectedSheet.getRowHeight(ri);
      }

      if (viewRange.sci <= cellRange.sci) {
        for (let ci = viewRange.sci; ci < cellRange.sci; ci++) {
          left += this.dataService.selectedSheet.getColWidth(ci);
        }
      } else {
        for (let ci = cellRange.sci; ci < viewRange.sci; ci++) {
          left -= this.dataService.selectedSheet.getColWidth(ci);
        }
      }
      for (let ci = cellRange.sci; ci <= cellRange.eci; ci++) {
        width += this.dataService.selectedSheet.getColWidth(ci);
      }
      return {
        left,
        top,
        width,
        height,
      };
    });
  }

  constructor(
    @Inject(Selector) private selectorFactory: SelectorFactory,
    private scrollingService: ScrollingService,
    private dataService: DataService,
    private viewRangeService: ViewRangeService,
    private configService: ConfigService,
  ) {}

  addRange(sri: number, eri: number, sci: number, eci: number): void {
    this.selectors.push(this.selectorFactory(sri, eri, sci, eci));
  }

  addOne(ri: number, ci: number): void {
    this.selectors.push(this.selectorFactory(ri, ri, ci, ci));
  }

  addWholeRow(ri: number): void {
    this.selectors.push(
      this.selectorFactory(
        ri,
        ri,
        0,
        this.dataService.selectedSheet.getColCount(),
      ),
    );
  }

  addWholeColumn(ci: number): void {
    this.selectors.push(
      this.selectorFactory(
        0,
        this.dataService.selectedSheet.getRowCount(),
        ci,
        ci,
      ),
    );
  }

  addAll(): void {
    this.selectors.push(
      this.selectorFactory(
        0,
        this.dataService.selectedSheet.getRowCount(),
        0,
        this.dataService.selectedSheet.getColCount(),
      ),
    );
  }

  lastResizeTo(eri: number, eci: number): void {
    const last = this.selectors[this.selectors.length - 1];
    // create a temp rect
    const [lastStartRi, lastStartCi] = last.startCord;
    const tempRect: Rect = {
      sri: Math.min(eri, lastStartRi),
      sci: Math.min(eci, lastStartCi),
      eri: Math.max(eri, lastStartRi),
      eci: Math.max(eci, lastStartCi),
    };
    // calc tempRect covered merge
    const coveredMerges = this.dataService.selectedSheet.merges.overlappedMergesBy(
      tempRect,
    );
    const targetRect = coveredMerges.reduce<Rect>((prev, item) => {
      return {
        sri: Math.min(prev.sri, item.sri),
        sci: Math.min(prev.sci, item.sci),
        eri: Math.max(prev.eri, item.eri),
        eci: Math.max(prev.eci, item.eci),
      };
    }, tempRect);
    last.resizeTo(targetRect);
  }

  removeAll(): void {
    this.selectors = [];
  }
}
