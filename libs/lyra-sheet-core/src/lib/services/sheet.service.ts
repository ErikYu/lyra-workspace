import type {
  CellData,
  Sheet,
  SheetData,
  RichTextLine,
  BorderType,
  CellFormat,
  CellStyle,
  TextAlignDir,
  TextStyle,
  TextValignDir,
  TextWrapType,
} from '../types';
import { ConfigService } from './config.service';
import { MergesService } from './merges.service';
import type { MergesServiceFactory } from './merges.service';
import { CellRange } from './cell-range.factory';
import { cloneDeep, isNumberedLines } from '../utils';
import { inject } from 'tsyringe';
import { BehaviorSubject, Observable, startWith, switchMap } from 'rxjs';
import { Selector } from './selector.factory';
import type { SelectorFactory } from './selector.factory';
import { ScrollingService } from './scrolling.service';
import { RenderProxyService } from './render-proxy.service';
import { Rect } from '../types';
import { MIN_ROW_HEIGHT } from '../constants';

export type SheetServiceFactory = (d: Sheet) => SheetService;

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

type TRows = SheetData['rows'];
type TRow = SheetData['rows'][0];
type TCells = SheetData['rows'][0]['cells'];

export class SheetService implements Sheet {
  selected!: boolean;
  merges!: MergesService;

  private selectors$ = new BehaviorSubject<Selector[]>([]);
  selectorChanged: Observable<Selector[]>;

  get isEmpty(): boolean {
    return this.selectors.length === 0;
  }

  get isNotEmpty(): boolean {
    return this.selectors.length !== 0;
  }

  selectors: Selector[] = [];

  get last(): Selector {
    return this.selectors[this.selectors.length - 1];
  }

  get data(): SheetData {
    return this.sheet.data;
  }

  get name(): string {
    return this.sheet.name;
  }
  set name(val: string) {
    this.sheet.name = val;
  }

  constructor(
    private sheet: Sheet,
    private configService: ConfigService,
    private scrollingService: ScrollingService,
    private renderProxyService: RenderProxyService,
    @inject(MergesService) private mergesServiceFactory: MergesServiceFactory,
    @inject(Selector) private selectorFactory: SelectorFactory,
  ) {
    this.selected = !!sheet.selected;
    this.merges = mergesServiceFactory(sheet.data.merges);
    this.selectorChanged = this.selectors$.asObservable();
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
    return this.data.rows[rowIndex]?.height || this.configService.defaultRH;
  }

  getColWidth(colIndex: number): number {
    return this.data.cols[colIndex]?.width || this.configService.defaultCW;
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

  getCell(ri: number, ci: number): CellData | undefined {
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

  getCol(ci: number): CellData[] {
    const res: CellData[] = [];
    for (const ri of Object.keys(this.sheet.data.rows)) {
      const cellData = this.getCell(+ri, ci);
      if (cellData) {
        res.push(cellData);
      }
    }
    return res;
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
      delete this.sheet.data.rows[rng.sri].cells[rng.sci].style!.merge;
    }
  }

  getHitMerge(ri: number, ci: number): CellRange | null {
    return this.merges.getHitMerge(ri, ci);
  }

  applyBgColorTo(cellRange: CellRange, color: string): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellStyle(ri, ci, { background: color });
    });
  }

  applyTextAlignTo(cellRange: CellRange, dir: TextAlignDir): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
      this.setCellStyle(ri, ci, { align: dir });
    });
  }

  applyTextValignTo(cellRange: CellRange, dir: TextValignDir): void {
    cellRange.forEachCell(this, ({ ri, ci }) => {
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

  adaptiveRowHeight(rowIndex: number) {
    const row = this.getRow(rowIndex);
    if (row) {
      row.height = Math.max(
        ...Object.values(row.cells).map((i) => i._calcRect!.height!),
        MIN_ROW_HEIGHT,
      );
    }
  }

  adaptiveColumnWidth(colIndex: number) {
    const cols = this.getCol(colIndex);
    if (cols.length > 0) {
      // const tmp = Math.max(...cols.map((i) => i._calcRect!.width!));
      // todo
    }
  }

  insertRowsAbove(ri: number, insertCount: number): void {
    const oldRows = this.sheet.data.rows;
    this.sheet.data.rows = Object.entries(oldRows).reduce<TRows>(
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

  deleteRows(sri: number, eri: number): void {
    const deleteCount = eri - sri + 1;
    this.sheet.data.rows = Object.entries(this.sheet.data.rows).reduce<TRows>(
      (prev, [riStr, row]) => {
        if (+riStr < sri) {
          return { ...prev, [+riStr]: row };
        } else if (sri <= +riStr && +riStr <= eri) {
          return prev;
        } else {
          return { ...prev, [+riStr - deleteCount]: row };
        }
      },
      {},
    );
    this.sheet.data.rowCount -= deleteCount;
    this.merges.moveOrShrinkByRow(sri, eri, (msri, msci, merge) => {
      this.setCellStyle(msri, msci, { merge });
    });
  }

  insertColsLeft(ci: number, insertCount: number): void {
    Object.values(this.sheet.data.rows).forEach((row) => {
      const { cells } = row;
      row.cells = Object.entries(cells).reduce<SheetData['rows'][0]['cells']>(
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

  deleteColumns(sci: number, eci: number): void {
    const deleteCount = eci - sci + 1;
    Object.values(this.sheet.data.rows).forEach((row) => {
      row.cells = Object.entries(row.cells).reduce<TCells>(
        (prev, [ciStr, cell]) => {
          if (+ciStr < sci) {
            return { ...prev, [+ciStr]: cell };
          } else if (sci <= +ciStr && +ciStr <= eci) {
            return prev;
          } else {
            return { ...prev, [+ciStr - deleteCount]: cell };
          }
        },
        {},
      );
    });
    this.sheet.data.colCount -= deleteCount;
    this.merges.moveAndShrinkByCol(sci, eci, (msri, msci, merge) => {
      this.setCellStyle(msri, msci, { merge });
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
            if (!Reflect.has(clonedRows, targetRI)) {
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

  deleteCells(cellRange: CellRange, shiftMode: 'left' | 'top'): void {
    if (shiftMode === 'left') {
      const deleteCount = cellRange.eci - cellRange.sci + 1;
      if (!this.merges.shiftLeft(cellRange)) {
        return;
      }
      const resRows: TRows = {};
      Object.entries(this.sheet.data.rows).forEach(([riStr, row]) => {
        const { cells } = row;
        resRows[+riStr] = {
          ...row,
          cells: Object.entries(cells).reduce<TCells>((prev, [ciStr, v]) => {
            if (+ciStr < cellRange.sci) {
              return { ...prev, [+ciStr]: v };
            } else {
              if (cellRange.sri <= +riStr && +riStr <= cellRange.eri) {
                const targetCI = +ciStr - deleteCount;
                if (targetCI >= cellRange.sci) {
                  return { ...prev, [+ciStr - deleteCount]: v };
                }
                return prev;
              } else {
                return { ...prev, [+ciStr]: v };
              }
            }
          }, {}),
        };
      });
      this.sheet.data.rows = resRows;
      this.sheet.data.colCount -= deleteCount;
    } else {
      const clonedRows = cloneDeep(this.sheet.data.rows);
      // const insertCount = -(cellRange.eri - cellRange.sri + 1);
      const deleteCount = cellRange.eri - cellRange.sri + 1;
      if (!this.merges.shiftTop(cellRange)) {
        return;
      }
      const resRows: TRows = {};
      const oldRows = Object.entries(clonedRows).reduce<TRows>(
        (prev, [ri, row]) => {
          if (+ri < cellRange.sri) {
            return { ...prev, [+ri]: row };
          } else {
            const targetRI = +ri - deleteCount;
            if (!Reflect.has(clonedRows, targetRI)) {
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
        } else {
          const r = Object.entries(
            this.getRow(ri + deleteCount)?.cells || {},
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
      this.sheet.data.rowCount -= deleteCount;
    }
  }

  clearText(cellRange: CellRange): void {
    cellRange.forEachCell(this, ({ ci, ri }) => {
      if (this.getCell(ri, ci)) {
        this.sheet.data.rows[ri].cells[ci].richText = [[]];
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
            style: styles,
          },
        },
      };
    } else {
      const cell = this.getCell(ri, ci);
      if (!cell) {
        row.cells[ci] = {
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
          },
        },
      };
    } else {
      const cell = this.getCell(ri, ci);
      if (!cell) {
        row.cells[ci] = {
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

  addRange(sri: number, eri: number, sci: number, eci: number): void {
    this.selectors.push(this.selectorFactory(sri, eri, sci, eci));
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  addOne(ri: number, ci: number): void {
    this.selectors.push(this.selectorFactory(ri, ri, ci, ci));
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  addWholeRow(ri: number): void {
    this.selectors.push(this.selectorFactory(ri, ri, 0, this.getColCount()));
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  addWholeColumn(ci: number): void {
    this.selectors.push(this.selectorFactory(0, this.getRowCount(), ci, ci));
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  addAll(): void {
    this.selectors.push(
      this.selectorFactory(0, this.getRowCount(), 0, this.getColCount()),
    );
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  lastResizeTo(eri: number | undefined, eci: number | undefined): void {
    const [lastStartCi, lastStartRi] = this.last.startCord;
    if (eri !== undefined && eci !== undefined) {
      // create a temp rect to find covered merges
      const tempRect: Rect = {
        sri: Math.min(eri, lastStartRi),
        sci: Math.min(eci, lastStartCi),
        eri: Math.max(eri, lastStartRi),
        eci: Math.max(eci, lastStartCi),
      };
      // calc tempRect covered merge
      const coveredMerges = this.merges.overlappedMergesBy(tempRect);
      const targetRect = coveredMerges.reduce<Rect>((prev, item) => {
        return {
          sri: Math.min(prev.sri, item.sri),
          sci: Math.min(prev.sci, item.sci),
          eri: Math.max(prev.eri, item.eri),
          eci: Math.max(prev.eci, item.eci),
        };
      }, tempRect);
      this.last.resizeTo(targetRect);
    } else if (eri !== undefined && eci === undefined) {
      const maxColIndex = this.getColCount();
      this.last.resizeTo({
        sri: Math.min(eri, lastStartRi),
        sci: Math.min(maxColIndex, lastStartCi),
        eri: Math.max(eri, lastStartRi),
        eci: Math.max(maxColIndex, lastStartCi),
      });
    } else if (eri === undefined && eci !== undefined) {
      const maxRowIndex = this.getRowCount();
      this.last.resizeTo({
        sri: Math.min(maxRowIndex, lastStartRi),
        sci: Math.min(eci, lastStartCi),
        eri: Math.max(maxRowIndex, lastStartRi),
        eci: Math.max(eci, lastStartCi),
      });
    }
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  removeAll(): void {
    this.selectors = [];
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }

  selectCell(ri: number, ci: number): void {
    this.selectors = [this.selectorFactory(ri, ri, ci, ci)];
    this.selectors$.next(this.selectors);
    this.renderProxyService.render('header');
  }
}
