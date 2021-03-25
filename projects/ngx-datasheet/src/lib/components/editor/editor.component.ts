import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ConfigService } from '../../core/config.service';
import { DataService } from '../../core/data.service';
import { Borders, CanvasService, Cord } from '../../core/canvas.service';
import {
  NDCellData,
  RichTextLine,
  RichTextSpan,
} from '../../ngx-datasheet.model';
import { colLabelFromIndex, isNil, isNumber } from '../../utils';
import { ScrollingService } from '../../core/scrolling.service';
import { EditorService } from './editor.service';
import { ViewRangeService } from '../../core/view-range.service';
import {
  DEFAULT_FONT_SIZE,
  GRID_LINE_WIDTH,
  GRID_STYLE,
  CELL_PADDING,
  DEFAULT_CELL_BG,
} from '../../constants';
import { LineWrapService } from '../../core/line-wrap.service';
import { MouseEventService } from '../../service/mouse-event.service';
import { ResizerColComponent } from '../resizer-col/resizer-col.component';
import { ResizerRowComponent } from '../resizer-row/resizer-row.component';
import { KeyboardEventService } from '../../service/keyboard-event.service';
import { CellFormat, TextAlignDir } from '../../models';

@Component({
  selector: 'nd-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  host: { class: 'nd-editor' },
  providers: [EditorService],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  canvasEl!: ElementRef<HTMLCanvasElement>;

  @ViewChild('vScrollbar', { read: ElementRef })
  vScrollbarEl!: ElementRef<HTMLElement>;

  @ViewChild('hScrollbar', { read: ElementRef })
  hScrollbarEl!: ElementRef<HTMLElement>;

  @ViewChild('masker', { read: ElementRef }) maskerEl!: ElementRef<HTMLElement>;
  @ViewChild(ResizerColComponent, { read: ElementRef })
  colResizer!: ElementRef<HTMLElement>;
  @ViewChild(ResizerRowComponent, { read: ElementRef })
  rowResizer!: ElementRef<HTMLElement>;
  constructor(
    public configService: ConfigService,
    public dataService: DataService,
    private canvasService: CanvasService,
    private scrolling: ScrollingService,
    private el: ElementRef<HTMLElement>,
    private editorService: EditorService,
    private viewRangeService: ViewRangeService,
    private lineWrapService: LineWrapService,
    private mouseEventService: MouseEventService,
    private keyboardEventService: KeyboardEventService,
  ) {}

  ngOnInit(): void {
    this.el.nativeElement.style.height = `${this.configService.configuration.sheetHeight}px`;
  }

  ngAfterViewInit(): void {
    this.canvasService.init(
      this.canvasEl.nativeElement,
      this.maskerEl.nativeElement,
    );
    this.mouseEventService.initDomElements(
      this.maskerEl.nativeElement,
      this.colResizer.nativeElement,
      this.rowResizer.nativeElement,
    );
    this.keyboardEventService.init();
    this.dataService.shouldRerender$.asObservable().subscribe(() => {
      this.canvasService.clear().beginPath();
      const rih = this.configService.configuration.row.indexHeight;
      const ciw = this.configService.configuration.col.indexWidth;
      this.canvasService.setStyle({
        strokeStyle: '#ccc',
        textBaseline: 'middle',
        textAlign: 'center',
        font: `500 14px Helvetica`,
      });
      this.renderGrid(rih, ciw);
      this.renderContent(rih, ciw);
      this.renderFixedHeader(rih, ciw);
      this.renderAnchor(rih, ciw);
    });
  }

  private renderAnchor(rih: number, ciw: number): void {
    this.canvasService.beginPath();
    this.canvasService.line([ciw, 0], [ciw, rih], [0, rih]);
  }

  /**
   * @param rih: row header height
   * @param ciw: column header height
   * @private
   */
  private renderFixedHeader(rih: number, ciw: number): void {
    this.canvasService.beginPath();
    this.canvasService.save();

    const { width, height } = this.viewRangeService.getViewRange();
    this.canvasService.setStyle({ fillStyle: '#f1f3f4' });
    this.canvasService.fillRect(0, 0, width + ciw, rih);
    this.canvasService.fillRect(0, 0, ciw, height + rih);

    this.canvasService.setStyle({
      strokeStyle: '#ccc',
      textBaseline: 'middle',
      textAlign: 'center',
      font: `500 12px Helvetica`,
      fillStyle: '#585757',
    });

    this.viewRangeService.cellRange.forEachCol(
      this.dataService.selectedSheet.data,
      (x, cw, ci) => {
        const start: Cord = [x + ciw, rih];
        const mid: Cord = [x + ciw + cw, rih];
        const end: Cord = [x + ciw + cw, 0];
        this.canvasService.preLine(start, mid, end);
        this.canvasService.fillText(
          colLabelFromIndex(ci),
          x + ciw + cw / 2,
          rih / 2,
        );
      },
    );

    this.viewRangeService.cellRange.forEachRow(
      this.dataService.selectedSheet.data,
      (y, rh, ri) => {
        const start: Cord = [ciw, y + rih];
        const mid: Cord = [ciw, y + rih + rh];
        const end: Cord = [0, y + rih + rh];
        this.canvasService.preLine(start, mid, end);
        this.canvasService.fillText(`${ri + 1}`, ciw / 2, y + rih + rh / 2);
      },
    );
    this.canvasService.stroke();
    this.canvasService.restore();
  }

  private renderGrid(rih: number, ciw: number): void {
    this.canvasService.save();
    this.canvasService.translate(ciw, rih);
    this.canvasService.beginPath();
    this.canvasService.setStyle(GRID_STYLE);

    this.viewRangeService.cellRange.forEachCol(
      this.dataService.selectedSheet.data,
      (x, cw) => {
        this.canvasService.preLine(
          [x + cw, 0],
          [x + cw, this.canvasService.height],
        );
      },
    );

    this.viewRangeService.cellRange.forEachRow(
      this.dataService.selectedSheet.data,
      (y, rh) => {
        this.canvasService.preLine(
          [0, y + rh],
          [this.canvasService.width, y + rh],
        );
      },
    );
    this.canvasService.stroke();
    this.canvasService.restore();
  }

  private renderContent(rih: number, ciw: number): void {
    this.canvasService.save();
    this.canvasService.translate(ciw, rih);
    this.viewRangeService.cellRange.forEachCell(
      this.dataService.selectedSheet,
      ({ left, top, cellData, width, height, ri, ci, shouldSkipRender }) => {
        if (cellData && !cellData.style?.format) {
          const plainText = this.dataService.selectedSheet.getCellPlainText(
            ri,
            ci,
          );
          if (isNumber(plainText)) {
            cellData._preFormat = 'number';
          } else {
            cellData._preFormat = 'text';
          }
        }
        if (!!cellData?.richText?.length && !shouldSkipRender) {
          // render rich text
          this.canvasService.save();
          this.renderCellRect(cellData, left, top, width, height);
          this.renderCellRichText(cellData, left, top, width, height);
          this.canvasService.restore();
        } else if (cellData?.plainText) {
          // render plain text directly
        }
      },
    );

    // render merged cells
    const mergesNeedRender = this.dataService.selectedSheet.merges.overlappedMergesBy(
      this.viewRangeService.cellRange,
    );
    mergesNeedRender.forEach((merRange) => {
      this.canvasService.save();
      const { left, top, width, height } = this.viewRangeService.locateRect(
        merRange,
      );
      const cellData = this.dataService.selectedSheet.getCell(
        merRange.sri,
        merRange.sci,
      );
      this.renderCellRect(cellData, left, top, width, height);
      if (!!cellData?.richText?.length) {
        this.renderCellRichText(cellData, left, top, width, height);
      }
      this.canvasService.restore();
    });
    this.canvasService.restore();
  }

  renderCellRect(
    cellData: NDCellData | undefined,
    left: number,
    top: number,
    width: number,
    height: number,
  ): void {
    this.canvasService.drawRect({
      left: left + GRID_LINE_WIDTH / 2,
      top: top + GRID_LINE_WIDTH / 2,
      width: width - GRID_LINE_WIDTH,
      height: height - GRID_LINE_WIDTH,
      // if wrap, after calling LineWrapService.lineWrapBuilder
      // should also use `clip`
      willClip: cellData?.style?.textWrap !== 'overflow',
      background: cellData?.style?.background || DEFAULT_CELL_BG,
      border: Object.entries(cellData?.style?.border || {}).reduce<Borders>(
        (prev, [side, value]) => {
          const [type, color] = value!;
          return { ...prev, [side]: { type, color } };
        },
        {},
      ),
    });
  }

  renderCellRichText(
    cellData: NDCellData,
    left: number,
    top: number,
    width: number,
    height: number,
  ): void {
    if (!cellData.richText) {
      return;
    }
    let textConverted = cellData.richText;
    // number precision convert
    if (!isNil(cellData.style?.precision)) {
      textConverted = this.lineWrapService.convOnPrecision(
        textConverted,
        cellData.style!.precision!,
      );
    }

    // format dropdown convert
    if (!!cellData.style?.format) {
      switch (cellData.style.format) {
        case 'percent':
          textConverted = this.lineWrapService.convOnPercent(textConverted);
          break;
        case 'scientific':
          textConverted = this.lineWrapService.convOnScientific(textConverted);
          break;
        case 'currency':
          textConverted = this.lineWrapService.convOnCurrency(textConverted);
          break;
        case 'currency_rounded':
          textConverted = this.lineWrapService.convOnCurrencyRounded(
            textConverted,
          );
          break;
        case 'financial':
          textConverted = this.lineWrapService.convOnFinancial(textConverted);
          break;
        case 'accounting':
          textConverted = this.lineWrapService.convOnAccounting(textConverted);
          break;
        case 'date':
          textConverted = this.lineWrapService.convOnDate(textConverted);
          break;
        case 'time':
          textConverted = this.lineWrapService.convOnTime(textConverted);
          break;
        case 'datetime':
          textConverted = this.lineWrapService.convOnDateTime(textConverted);
          break;
      }
    }

    // text wrap convert
    if (cellData.style?.textWrap === 'wrap') {
      textConverted = this.lineWrapService.lineWrapBuilder(
        textConverted,
        width,
      );
    }

    // draw rich text
    // pre calc the whole height of text zone
    // if we need to put text valign: bottom
    const [allLinesHeight, lineHeights] = textConverted.reduce(
      (prev, line) => {
        const lineHeight = line.reduce<number>((preMax, { style }) => {
          return (style?.fontSize || DEFAULT_FONT_SIZE) > preMax
            ? style?.fontSize || DEFAULT_FONT_SIZE
            : preMax;
        }, 0);
        return [prev[0] + lineHeight, [...prev[1], lineHeight]];
      },
      [0, []] as [number, number[]],
    );

    let offsetTop: number;
    if (height > allLinesHeight) {
      // should only work for cellHeight > textZoneHeight
      switch (cellData.style?.valign) {
        case 'center':
          offsetTop = top + (height - allLinesHeight) / 2;
          break;
        case 'top':
          offsetTop = top + GRID_LINE_WIDTH / 2 + CELL_PADDING;
          break;
        case 'bottom':
        default:
          offsetTop =
            top + height - allLinesHeight - GRID_LINE_WIDTH / 2 - CELL_PADDING;
      }
    } else {
      // when cellHeight < textZoneHeight
      // always render from top
      offsetTop = top;
    }
    for (const [index, line] of Object.entries(textConverted)) {
      const lineHeight = lineHeights[+index];
      offsetTop += lineHeight;

      let offsetLeft: number;

      // NOTICE: if format is accounting, the align should always be right
      let align: TextAlignDir;
      // if (cellData.style?.format === 'accounting') {
      //   align = 'right';
      // } else if ((cellData.style?.format || cellData._preFormat) === 'text') {
      //   align = cellData.style?.align || 'left';
      // } else {
      //   align = cellData.style?.align || 'right';
      // }

      const m: Record<NonNullable<CellFormat>, TextAlignDir> = {
        text: 'left',
        number: 'right',
        percent: 'right',
        scientific: 'right',
        accounting: 'right',
        currency: 'right',
        currency_rounded: 'right',
        financial: 'right',
        date: 'right',
        time: 'right',
        datetime: 'right',
      };
      if (cellData.style?.format === 'accounting') {
        align = 'right';
      } else if (!!cellData.style?.align) {
        align = cellData.style?.align;
      } else if (!!cellData.style?.format) {
        align = m[cellData.style.format];
      } else {
        align = m[cellData._preFormat!];
      }
      switch (align) {
        case 'center':
          const [lineWidth, spanWidths] = line.reduce(
            (prev, span) => {
              this.canvasService.textStyle(span.style);
              const spanWidth = this.canvasService.measureTextWidth(span.text);
              return [prev[0] + spanWidth, [...prev[1], spanWidth]];
            },
            [0, []] as [number, number[]],
          );
          offsetLeft = left + (width - lineWidth) / 2;
          for (const [spanIndex, span] of Object.entries(line)) {
            this.canvasService.textStyle(span.style);
            const spanWidth = spanWidths[+spanIndex];
            this.fillTextBySpan(span, offsetLeft, offsetTop, spanWidth);
            offsetLeft += spanWidth;
          }
          break;
        case 'right':
          offsetLeft = left + width - GRID_LINE_WIDTH / 2 - CELL_PADDING;
          for (const span of line.reverse()) {
            this.canvasService.textStyle(span.style);
            const spanWidth = this.canvasService.measureTextWidth(span.text);
            offsetLeft -= spanWidth;
            if (index === '0' && cellData.style?.format === 'accounting') {
              this.fillTextBySpan(
                { text: '$', style: span.style },
                GRID_LINE_WIDTH / 2 + CELL_PADDING,
                offsetTop,
                10,
              );
            }
            this.fillTextBySpan(span, offsetLeft, offsetTop, spanWidth);
          }
          break;
        case 'left':
        default:
          offsetLeft = left + GRID_LINE_WIDTH / 2 + CELL_PADDING;
          for (const span of line) {
            this.canvasService.textStyle(span.style);
            const spanWidth = this.canvasService.measureTextWidth(span.text);
            this.fillTextBySpan(span, offsetLeft, offsetTop, spanWidth);
            offsetLeft += spanWidth;
          }
      }
    }
  }

  private fillTextBySpan(
    span: RichTextSpan,
    left: number,
    top: number,
    spanWidth: number,
  ): void {
    this.canvasService.fillText(span.text, left, top);
    this.canvasService.setStyle({ lineWidth: 1 });
    this.canvasService.beginPath();
    if (span.style?.underline) {
      this.canvasService.preLine([left, top], [left + spanWidth, top]);
    }
    if (span.style?.strike) {
      const spanHeight = span.style.fontSize || DEFAULT_FONT_SIZE;
      this.canvasService.preLine(
        [left, top - spanHeight / 2],
        [left + spanWidth, top - spanHeight / 2],
      );
    }
    this.canvasService.stroke();
  }
}
