import { ConfigService } from './config.service';
import { NDCellData, NDSheetData } from '../ngx-datasheet.model';
import { SheetService } from './sheet.service';
import { Rect } from '../models';

interface CellParams {
  left: number; // cell left coordinate - from right side of col-header-zone
  top: number; // cell top coordinate - from bottom side of row-header-zone
  ri: number; // row index
  ci: number; // column index
  cellData: NDCellData | undefined;
  width: number;
  height: number;
  shouldSkipRender: boolean;
}

export type CellRangeFactory = (
  sri: number,
  eri: number,
  sci: number,
  eci: number,
) => CellRange;

export class CellRange implements Rect {
  constructor(
    public sri: number,
    public eri: number,
    public sci: number,
    public eci: number,
    private configService: ConfigService,
  ) {}

  get isSingleCell(): boolean {
    return this.sri === this.eri && this.sci === this.eci;
  }

  // x - left side coordinate of this column
  // cw - column width
  // ci - column index
  forEachCol(
    d: NDSheetData,
    iterator: (x: number, cw: number, ci: number) => void,
  ): void {
    let x = 0;
    for (let ci = this.sci; ci <= this.eci; ci++) {
      const colWidth = d.cols[ci]?.width || this.configService.defaultCW;
      iterator(x, colWidth, ci);
      x += colWidth;
    }
  }

  forEachRow(
    d: NDSheetData,
    iterator: (y: number, rh: number, ri: number) => void,
  ): void {
    let y = 0;
    for (let ri = this.sri; ri <= this.eri; ri++) {
      const rowHeight = d.rows[ri]?.height || this.configService.defaultRH;
      iterator(y, rowHeight, ri);
      y += rowHeight;
    }
  }

  rowIndexAt(selectedSheet: SheetService, top: number): number {
    if (top <= 0) {
      throw Error('top can not be lower then ZERO');
    }
    let y = 0;
    for (let ri = this.sri; ri <= this.eri; ri++) {
      const rowHeight = selectedSheet.getRowHeight(ri);
      if (y <= top && top < y + rowHeight) {
        return ri;
      }
      y += rowHeight;
    }
    throw Error('should not go here');
  }

  colIndexAt(selectedSheet: SheetService, left: number): number {
    if (left <= 0) {
      throw Error('left can not be lower then ZERO');
    }
    let x = 0;
    for (let ci = this.sci; ci <= this.eci; ci++) {
      const colWidth = selectedSheet.getColWidth(ci);
      if (x <= left && left < x + colWidth) {
        return ci;
      }
      x += colWidth;
    }
    throw Error(`should not go here, left: ${left}`);
  }

  forEachCell(
    selectedSheet: SheetService,
    iterator: (params: CellParams) => void,
  ): void {
    const d = selectedSheet.data;
    let y = 0;
    // item is {`1,2`, `2,3`}: `ri,ci`
    const overlappedCells = new Set<string>();
    for (let ri = this.sri; ri <= this.eri; ri++) {
      let x = 0;
      const rowHeight = d.rows[ri]?.height || this.configService.defaultRH;
      for (let ci = this.sci; ci <= this.eci; ci++) {
        const colWidth = d.cols[ci]?.width || this.configService.defaultCW;

        let cellRectHeight = rowHeight;
        let cellRectWidth = colWidth;

        const cellData = selectedSheet.getCell(ri, ci);
        const merge = cellData?.style?.merge || [0, 0];
        if (merge[0] > 0 || merge[1] > 0) {
          for (let yMerge = 0; yMerge <= merge[0]; yMerge++) {
            if (yMerge > 0) {
              cellRectHeight += selectedSheet.getRowHeight(ri + yMerge);
            }
            for (let xMerge = 0; xMerge <= merge[1]; xMerge++) {
              if (yMerge === 0 && xMerge > 0) {
                cellRectWidth += selectedSheet.getColWidth(ci + xMerge);
              }
              if (xMerge !== 0 || yMerge !== 0) {
                overlappedCells.add(`${ri + yMerge},${ci + xMerge}`);
              }
            }
          }
        }
        iterator({
          ri,
          ci,
          cellData,
          left: x,
          top: y,
          height: cellRectHeight,
          width: cellRectWidth,
          shouldSkipRender: overlappedCells.has(`${ri},${ci}`),
        });
        x += colWidth;
      }
      y += rowHeight;
    }
  }

  overlappingWithRange(cellRange: Rect): boolean {
    return (
      this.sri <= cellRange.eri &&
      this.sci <= cellRange.eci &&
      cellRange.sri <= this.eri &&
      cellRange.sci <= this.eci
    );
  }

  overlappingWithCell(ri: number, ci: number): boolean {
    return this.sri <= ri && this.sci <= ci && ri <= this.eri && ci <= this.eci;
  }

  containsCell(rowIndex: number, colIndex: number): boolean {
    return this.interactsWithRow(rowIndex) && this.interactsWithCol(colIndex);
  }

  interactsWithRow(rowIndex: number): boolean {
    return rowIndex <= this.eri && rowIndex >= this.sri;
  }

  interactsWithCol(colIndex: number): boolean {
    return colIndex <= this.eci && colIndex >= this.sci;
  }

  equals(rect: Rect): boolean {
    return (
      this.sci === rect.sci &&
      this.eci === rect.eci &&
      this.sri === rect.sri &&
      this.eri === rect.eri
    );
  }
}
