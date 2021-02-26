import { NDCellData, NDSheet, NDSheetData } from '../ngx-datasheet.model';
import { ConfigService } from './config.service';
import { Inject } from '@angular/core';
import { MergesService, MergesServiceFactory } from './merges.service';
import { CellRange } from './cell-range.factory';
import { BorderType, CellStyle, TextAlignDir, TextValignDir } from '../models';

export type SheetServiceFactory = (d: NDSheet) => SheetService;

export type BorderSelection =
  | 'all'
  | 'inner'
  | 'horizontal'
  | 'vertical'
  | 'outer'
  | 'left'
  | 'top'
  | 'right'
  | 'bottom'
  | 'clear';

export class SheetService {
  selected!: boolean;
  merges!: MergesService;

  get data(): NDSheetData {
    return this.sheet.data;
  }

  get name(): string {
    return this.sheet.name;
  }

  constructor(
    private sheet: NDSheet,
    private configService: ConfigService,
    @Inject(MergesService) private mergesServiceFactory: MergesServiceFactory,
  ) {
    this.merges = mergesServiceFactory(sheet.data.merges);
  }

  getTotalHeight(): number {
    let res = 0;
    for (let ri = 0; ri < this.data.rowCount; ri++) {
      const thisRowHeight = this.getRowHeight(ri);
      res += thisRowHeight;
    }
    return res;
  }

  getTotalWidth(): number {
    let res = 0;
    for (let ci = 0; ci < this.data.colCount; ci++) {
      const thisColWidth = this.getColWidth(ci);
      res += thisColWidth;
    }
    return res;
  }

  getRowHeight(rowIndex: number): number {
    return (
      this.data.rows[rowIndex]?.height ||
      this.configService.configuration.row.height
    );
  }

  getColWidth(colIndex: number): number {
    return (
      this.data.cols[colIndex]?.width ||
      this.configService.configuration.col.width
    );
  }

  getRowCount(): number {
    return this.data.rowCount;
  }

  getColCount(): number {
    return this.data.colCount;
  }

  /**
   * @param scrollTop: the vertical scrollbar's scrollTop
   */
  getRowIndex(scrollTop: number): number {
    let totalHeightTillRi = 0;
    let ri;
    for (ri = 0; ri < this.data.rowCount; ri++) {
      totalHeightTillRi += this.getRowHeight(ri);
      if (totalHeightTillRi >= scrollTop) {
        return ri;
      }
    }
    return ri;
  }

  getColIndex(scrollLeft: number): number {
    let totalWidthTillCi = 0;
    let ci;
    for (ci = 0; ci < this.data.colCount; ci++) {
      totalWidthTillCi += this.getColWidth(ci);
      if (totalWidthTillCi >= scrollLeft) {
        return ci;
      }
    }
    return ci;
  }

  getCell(ri: number, ci: number): NDCellData | undefined {
    return this.data.rows[ri]?.cells[ci];
  }

  // tslint:disable-next-line:typedef
  getRow(ri: number) {
    return this.sheet.data.rows[ri];
  }

  applyMergeTo(cellRange: CellRange): void {
    this.merges.addMerge(cellRange);
    // update style
    const { sri, sci, eri, eci } = cellRange;
    this.setCellStyle(sri, sci, { merge: [eri - sri, eci - sci] });
  }

  removeMergesInside(cellRange: CellRange): void {
    const mergeRangesNeedToRemove = this.merges.overlappedMergesBy(cellRange);
    if (mergeRangesNeedToRemove.length === 0) {
      throw Error('No merge found. Should not ge here!');
    }
    for (const rng of mergeRangesNeedToRemove) {
      this.merges.removeMerge(rng);
      // @ts-ignore
      delete this.sheet.data.rows[rng.sri].cells[rng.sci].style.merge;
    }
  }

  getHitMerge(ri: number, ci: number): CellRange | null {
    return this.merges.getHitMerge(ri, ci);
  }

  applyBgColorTo(cellRange: CellRange, color: string): void {
    cellRange.forEachCell(this, ({ ri, ci, cellData }) => {
      this.setCellStyle(ri, ci, { background: color });
    });
  }

  applyTextAlignTo(cellRange: CellRange, dir: TextAlignDir): void {
    cellRange.forEachCell(this, ({ ri, ci, cellData }) => {
      this.setCellStyle(ri, ci, { align: dir });
    });
  }

  applyTextValignTo(cellRange: CellRange, dir: TextValignDir): void {
    cellRange.forEachCell(this, ({ ri, ci, cellData }) => {
      this.setCellStyle(ri, ci, { valign: dir });
    });
  }

  applyBorderTo(
    cellRange: CellRange,
    bs: BorderSelection,
    borderType: BorderType,
    borderColor: string,
  ): void {
    const leftDrawer = (ri: number, ci: number) => {
      this.setBorder(ri, ci, 'left', borderType, borderColor);
    };
    const rightDrawer = (ri: number, ci: number) => {
      this.setBorder(ri, ci, 'right', borderType, borderColor);
    };
    const topDrawer = (ri: number, ci: number) => {
      this.setBorder(ri, ci, 'top', borderType, borderColor);
    };
    const bottomDrawer = (ri: number, ci: number) => {
      this.setBorder(ri, ci, 'bottom', borderType, borderColor);
    };

    cellRange.forEachCell(this, ({ ri, ci, shouldSkipRender }) => {
      if (!shouldSkipRender) {
        switch (bs) {
          case 'left':
            if (ci === cellRange.sci) {
              leftDrawer(ri, ci);
            }
            break;
          case 'right':
            if (ci === cellRange.eci) {
              rightDrawer(ri, ci);
            }
            break;
          case 'top':
            if (ri === cellRange.sri) {
              topDrawer(ri, ci);
            }
            break;
          case 'bottom':
            if (ri === cellRange.eri) {
              bottomDrawer(ri, ci);
            }
            break;
          case 'outer':
            if (ci === cellRange.sci) {
              leftDrawer(ri, ci);
            }
            if (ci === cellRange.eci) {
              rightDrawer(ri, ci);
            }
            if (ri === cellRange.sri) {
              topDrawer(ri, ci);
            }
            if (ri === cellRange.eri) {
              bottomDrawer(ri, ci);
            }
            break;
          case 'inner':
            if (!cellRange.isSingleCell) {
              if (ci < cellRange.eci && ri < cellRange.eri) {
                rightDrawer(ri, ci);
                bottomDrawer(ri, ci);
              } else if (ci === cellRange.eci && ri < cellRange.eri) {
                bottomDrawer(ri, ci);
              } else if (ci < cellRange.eci && ri === cellRange.eri) {
                rightDrawer(ri, ci);
              }
            }
            break;
          case 'horizontal':
            if (!cellRange.isSingleCell) {
              if (ci <= cellRange.eci && ri < cellRange.eri) {
                bottomDrawer(ri, ci);
              }
            }
            break;
          case 'vertical':
            if (ci < cellRange.eci && ri <= cellRange.eri) {
              rightDrawer(ri, ci);
            }
            break;
          case 'clear':
            this.setCellStyle(ri, ci, {
              border: {},
            });
            break;
          case 'all':
          default:
            this.setCellStyle(ri, ci, {
              border: {
                left: [borderType, borderColor],
                top: [borderType, borderColor],
                right: [borderType, borderColor],
                bottom: [borderType, borderColor],
              },
            });
            break;
        }
      }
    });
  }

  private setBorder(
    ri: number,
    ci: number,
    dir: 'left' | 'right' | 'top' | 'bottom',
    borderType: BorderType,
    borderColor: string,
  ): void {
    const prevBorder = this.getCell(ri, ci)?.style?.border || {};
    this.setCellStyle(ri, ci, {
      border: { ...prevBorder, [dir]: [borderType, borderColor] },
    });
  }

  private setCellStyle(ri: number, ci: number, styles: CellStyle): void {
    const row = this.getRow(ri);
    if (!row) {
      this.data.rows[ri] = {
        cells: {
          [ci]: {
            richText: [[]],
            plainText: '',
            style: styles,
          },
        },
      };
    } else {
      const cell = this.getCell(ri, ci);
      if (!cell) {
        row.cells[ci] = {
          plainText: '',
          richText: [[]],
          style: styles,
        };
      } else {
        cell.style = {
          ...cell.style,
          ...styles,
        };
      }
    }
  }
}
