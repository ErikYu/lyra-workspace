import { Inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { DataService } from './data.service';
import { LocatedRect, Rect } from '../models';

@Injectable()
export class ViewRangeService {
  private width!: number;
  private height!: number;

  cellRange: CellRange;

  constructor(
    private configService: ConfigService,
    private dataService: DataService,
    @Inject(CellRange) private cellRangeFactory: CellRangeFactory,
  ) {
    this.cellRange = cellRangeFactory(0, 0, 0, 0);
  }

  init(): void {
    this.width =
      this.configService.configuration.sheetWidth -
      this.configService.scrollbarThick -
      this.configService.configuration.col.indexWidth;
    this.height =
      this.configService.configuration.sheetHeight -
      this.configService.scrollbarThick -
      this.configService.tabBarHeight -
      this.configService.configuration.row.indexHeight;
    this.cellRange.sri = 0;
    this.cellRange.eri = this.dataService.selectedSheet.getRowIndex(
      this.height,
    );
    this.cellRange.sci = 0;
    this.cellRange.eci = this.dataService.selectedSheet.getColIndex(this.width);
  }

  // tslint:disable-next-line:typedef
  getViewRange() {
    return {
      width: this.width,
      height: this.height,
      sri: this.cellRange.sri,
      eri: this.cellRange.eri,
      sci: this.cellRange.sci,
      eci: this.cellRange.eci,
    };
  }

  // tslint:disable-next-line:typedef
  sizeRect(rect: Rect) {
    const tmp = this.cellRangeFactory(rect.sri, rect.eri, rect.sci, rect.eci);
    let height = 0;
    tmp.forEachRow(this.dataService.selectedSheet.data, (y, rh) => {
      height += rh;
    });
    let width = 0;
    tmp.forEachCol(this.dataService.selectedSheet.data, (x, cw) => {
      width += cw;
    });
    return { width, height };
  }

  // relative to A1's left-top point
  locateRect(rect: Rect): LocatedRect {
    const size = this.sizeRect(rect);
    let top = 0;
    if (rect.sri > this.cellRange.sri) {
      for (let ri = this.cellRange.sri; ri < rect.sri; ri++) {
        top += this.dataService.selectedSheet.getRowHeight(ri);
      }
    } else if (rect.sri < this.cellRange.sri) {
      for (let ri = rect.sri; ri < this.cellRange.sri; ri++) {
        top -= this.dataService.selectedSheet.getRowHeight(ri);
      }
    }

    let left = 0;
    if (rect.sci > this.cellRange.sci) {
      for (let ci = this.cellRange.sci; ci < rect.sci; ci++) {
        left += this.dataService.selectedSheet.getColWidth(ci);
      }
    } else if (rect.sci < this.cellRange.sci) {
      for (let ci = rect.sci; ci < this.cellRange.sci; ci++) {
        left -= this.dataService.selectedSheet.getColWidth(ci);
      }
    }
    return {
      ...rect,
      ...size,
      left,
      top,
    };
  }

  setRowRange(start: number, offsetTop: number): void {
    this.cellRange.sri = start;
    this.cellRange.eri =
      this.dataService.selectedSheet.getRowIndex(offsetTop + this.height) + 1;
  }

  setColRange(start: number, offsetLeft: number): void {
    this.cellRange.sci = start;
    this.cellRange.eci =
      this.dataService.selectedSheet.getColIndex(offsetLeft + this.width) + 1;
  }
}
