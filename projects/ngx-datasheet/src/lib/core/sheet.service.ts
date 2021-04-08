import {
  NDCellData,
  NDSheet,
  NDSheetData,
  RichTextLine,
} from '../ngx-datasheet.model';
import { ConfigService } from './config.service';
import { Inject } from '@angular/core';
import { MergesService, MergesServiceFactory } from './merges.service';
import { CellRange } from './cell-range.factory';
import {
  BorderType,
  CellFormat,
  CellStyle,
  TextAlignDir,
  TextStyle,
  TextValignDir,
  TextWrapType,
} from '../models';
import { cloneDeep, isNumberedLines } from '../utils';

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

type TRows = NDSheetData['rows'];
type TRow = NDSheetData['rows'][0];
type TCells = NDSheetData['rows'][0]['cells'];

export class SheetService implements NDSheet {
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
    this.selected = !!sheet.selected;
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

  getCellPlainText(ri: number, ci: number): string | undefined {
    const cell = this.getCell(ri, ci);
    if (cell && Array.isArray(cell.richText) && cell.richText.length > 0) {
      let res = '';
      for (const line of cell.richText) {
        for (const span of line) {
          res += span.text;
        }
      }
      return res;
    }
    return undefined;
  }

  getRow(ri: number): TRow | undefined {
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

  applyTextWrapTo(cellRange: CellRange, textWrapType: TextWrapType): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellStyle(ri, ci, { textWrap: textWrapType });
    });
  }

  applyPrecisionTo(cellRange: CellRange, precision: number): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellStyle(ri, ci, { precision });
    });
  }

  resetPrecisionTo(cellRange: CellRange): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      const cell = this.getCell(ri, ci);
      if (cell && cell.style && Reflect.has(cell.style, 'precision')) {
        Reflect.deleteProperty(cell.style, 'precision');
      }
    });
  }

  applyCellFormatTo(cellRange: CellRange, format: CellFormat): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      const cell = this.getCell(ri, ci);
      const numberFormats: CellFormat[] = [
        'percent',
        'currency',
        'currency_rounded',
        'financial',
        'accounting',
        'scientific',
      ];
      if (numberFormats.includes(format) && !isNumberedLines(cell?.richText)) {
        return;
      }
      this.setCellStyle(ri, ci, { format });
    });
  }

  removeCellFormatFrom(cellRange: CellRange): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      const cell = this.getCell(ri, ci);
      if (cell && cell.style && Reflect.has(cell.style, 'format')) {
        Reflect.deleteProperty(cell.style, 'format');
      }
    });
  }

  applyTextColorTo(cellRange: CellRange, color: string): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { color });
    });
  }

  applyTextBoldTo(cellRange: CellRange, bold: boolean): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { bold });
    });
  }

  applyTextItalicTo(cellRange: CellRange, italic: boolean): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { italic });
    });
  }

  applyTextStrikeTo(cellRange: CellRange, strike: boolean): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { strike });
    });
  }

  applyTextUnderlineTo(cellRange: CellRange, underline: boolean): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { underline });
    });
  }

  applyTextSizeTo(cellRange: CellRange, fontSize: number): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { fontSize });
    });
  }

  applyTextFontFamilyTo(cellRange: CellRange, fontName: string): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellRichTextStyle(ri, ci, { fontName });
    });
  }

  applyRichTextToCell(ri: number, ci: number, richText: RichTextLine[]): void {
    this.setCellRichText(ri, ci, richText);
  }

  resizeColWidth(colIndex: number, delta: number): void {
    const oldWidth =
      this.sheet.data.cols[colIndex]?.width || this.configService.defaultCW;
    this.sheet.data.cols[colIndex] = { width: oldWidth + delta };
  }

  resizeRowHeight(rowIndex: number, delta: number): void {
    const oldHeight =
      this.sheet.data.rows[rowIndex]?.height || this.configService.defaultRH;
    const row = this.getRow(rowIndex);
    if (!row) {
      this.sheet.data.rows[rowIndex] = { height: oldHeight + delta, cells: {} };
    } else {
      row.height = oldHeight + delta;
    }
  }

  insertRowsAbove(ri: number, insertCount: number): void {
    const oldRows = this.sheet.data.rows;
    this.sheet.data.rows = Object.entries(oldRows).reduce<NDSheetData['rows']>(
      (prev, [i, v]) => {
        if (+i < ri) {
          return { ...prev, [+i]: v };
        } else {
          return { ...prev, [+i + insertCount]: v };
        }
      },
      {},
    );
    this.sheet.data.rowCount += insertCount;
    // merge data should also be updated
    this.merges.moveOrExpandByRow(ri, insertCount, (sri, sci) => {
      // merge attribute should update when expand rows
      const cell = this.getCell(sri, sci);
      const merge = cell?.style?.merge;
      if (merge === undefined) {
        throw Error('Should not reach here. Cannot find merge');
      }
      merge[0] += insertCount;
    });
  }

  insertColsLeft(ci: number, insertCount: number): void {
    Object.values(this.sheet.data.rows).forEach((row) => {
      const { cells } = row;
      row.cells = Object.entries(cells).reduce<NDSheetData['rows'][0]['cells']>(
        (prev, [i, v]) => {
          if (+i < ci) {
            return { ...prev, [+i]: v };
          } else {
            return { ...prev, [+i + insertCount]: v };
          }
        },
        {},
      );
    });
    this.sheet.data.colCount += insertCount;
    this.merges.moveOrExpandByCol(ci, insertCount, (sri, sci) => {
      // merge attribute should update when expand rows
      const cell = this.getCell(sri, sci);
      const merge = cell?.style?.merge;
      if (merge === undefined) {
        throw Error('Should not reach here. Cannot find merge');
      }
      merge[1] += insertCount;
    });
  }

  insertCells(cellRange: CellRange, shiftMode: 'right' | 'down'): void {
    if (shiftMode === 'right') {
      // insert col
      const insertCount = cellRange.eci - cellRange.sci + 1;
      if (!this.merges.shiftRight(cellRange, insertCount)) {
        return;
      }
      Object.entries(this.sheet.data.rows).forEach(([riStr, row]) => {
        const { cells } = row;
        row.cells = Object.entries(cells).reduce<TCells>((prev, [ciStr, v]) => {
          if (+ciStr < cellRange.sci) {
            return { ...prev, [+ciStr]: v };
          } else {
            if (cellRange.sri <= +riStr && +riStr <= cellRange.eri) {
              return { ...prev, [+ciStr + insertCount]: v };
            } else {
              return { ...prev, [+ciStr]: v };
            }
          }
        }, {});
      });
      this.sheet.data.colCount += insertCount;
    } else {
      const insertCount = cellRange.eri - cellRange.sri + 1;
      if (!this.merges.shiftDown(cellRange, insertCount)) {
        return;
      }

      const resRows: TRows = {};
      const clonedRows = cloneDeep(this.sheet.data.rows);
      const oldRows = Object.entries(clonedRows).reduce<TRows>(
        (prev, [ri, row]) => {
          if (+ri < cellRange.sri) {
            return { ...prev, [+ri]: row };
          } else {
            const targetRI = +ri + insertCount;
            if (!clonedRows.hasOwnProperty(targetRI)) {
              return {
                ...prev,
                [+ri]: row,
                [targetRI]: { cells: {} },
              };
            } else {
              return {
                ...prev,
                [+ri]: row,
              };
            }
          }
        },
        {},
      );
      for (const [riStr, row] of Object.entries(oldRows)) {
        const ri = +riStr;
        if (ri < cellRange.sri) {
          resRows[ri] = row;
        } else if (cellRange.sri <= ri && ri <= cellRange.eri) {
          Object.keys(row.cells).forEach((ciStr) => {
            if (cellRange.sci <= +ciStr && +ciStr <= cellRange.eci) {
              delete row.cells[+ciStr];
            }
          });
          resRows[ri] = row;
        } else {
          const r = Object.entries(
            this.getRow(ri - insertCount)?.cells || {},
          ).reduce<TCells>((prev, [iStr, cell]) => {
            if (cellRange.sci <= +iStr && +iStr <= cellRange.eci) {
              return { ...prev, [+iStr]: cell };
            }
            return prev;
          }, {});

          resRows[ri] = {
            ...row,
            cells: Object.entries(row.cells).reduce<TCells>(
              (prevCells, [ciStr, cell]) => {
                if (cellRange.sci <= +ciStr && +ciStr <= cellRange.eci) {
                  return prevCells;
                } else {
                  return { ...prevCells, [+ciStr]: cell };
                }
              },
              r,
            ),
          };
        }
      }
      this.sheet.data.rows = resRows;
      this.sheet.data.rowCount += insertCount;
    }
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

  private setCellRichText(
    ri: number,
    ci: number,
    richText: Array<RichTextLine>,
  ): void {
    const row = this.getRow(ri);
    if (!row) {
      this.data.rows[ri] = {
        cells: {
          [ci]: {
            richText,
            plainText: '',
          },
        },
      };
    } else {
      const cell = this.getCell(ri, ci);
      if (!cell) {
        row.cells[ci] = {
          plainText: '',
          richText,
        };
      } else {
        cell.richText = richText;
      }
    }
  }

  private setCellRichTextStyle(ri: number, ci: number, style: TextStyle): void {
    const oldRichText: RichTextLine[] = this.getCell(ri, ci)?.richText || [
      [{ text: '' }],
    ];
    this.setCellRichText(
      ri,
      ci,
      oldRichText.map((line) =>
        line.map((span) => ({ ...span, style: { ...span.style, ...style } })),
      ),
    );
  }
}
