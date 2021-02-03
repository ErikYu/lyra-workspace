import { Inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { CellRange, CellRangeFactory } from './cell-range.factory';
import { DataService } from './data.service';

@Injectable()
export class ViewRangeService {
  private width!: number;
  private height!: number;

  cellRange: CellRange;

  constructor(
    private configService: ConfigService,
    private dataService: DataService,
    @Inject(CellRange) cellRangeFactory: CellRangeFactory,
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
