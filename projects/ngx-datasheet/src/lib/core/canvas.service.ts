import { Injectable } from '@angular/core';
import { DprService } from './dpr.service';
import { ConfigService } from './config.service';
import { BorderType, Cord, TextStyle } from '../models';
import {
  DEFAULT_TEXT_STYLE,
  GRID_LINE_WIDTH,
  CELL_PADDING,
  DEFAULT_BORDER_WIDTH,
} from '../constants';

interface Border {
  type: BorderType;
  color: string;
}

export interface Borders {
  left?: Border;
  right?: Border;
  top?: Border;
  bottom?: Border;
}

interface CellRectParams {
  left: number;
  top: number;
  width: number;
  height: number;
  willClip: boolean;
  background: string;
  border: Borders;
}

@Injectable()
export class CanvasService {
  private el!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;

  get height(): number {
    return this.el.getBoundingClientRect().height;
  }

  get width(): number {
    return this.el.getBoundingClientRect().width;
  }

  constructor(private dpr: DprService, private configService: ConfigService) {}

  init(el: HTMLCanvasElement, maskerEl: HTMLElement): void {
    this.el = el;
    this.context = this.el.getContext('2d')!;
    this.configService.config$.subscribe(({ sheetWidth, sheetHeight }) => {
      const width = sheetWidth - this.configService.scrollbarThick;
      const height =
        sheetHeight -
        this.configService.scrollbarThick -
        this.configService.tabBarHeight;

      maskerEl.style.width = `${width}px`;
      maskerEl.style.height = `${height}px`;

      // for dpr > 1 screen
      this.el.style.width = `${width}px`;
      this.el.style.height = `${height}px`;
      this.el.width = this.dpr.rpx(width);
      this.el.height = this.dpr.rpx(height);
      this.scale(this.dpr.dpr(), this.dpr.dpr());
    });
  }

  setStyle(styles: Partial<CanvasRenderingContext2D>): CanvasService {
    Object.assign(this.context, styles);
    return this;
  }

  textStyle(style: TextStyle | undefined): CanvasService {
    const s: TextStyle = {
      ...DEFAULT_TEXT_STYLE,
      ...style,
    };
    // prettier-ignore
    Object.assign(this.context, {
      textAlign: 'start',
      font: `${s.italic ? 'italic' : ''} ${s.bold ? 700 : 500} ${s.fontSize}px ${s.fontName}`,
      fillStyle: s.color,
      strokeStyle: s.color,
      textBaseline: 'bottom',
    } as Partial<CanvasRenderingContext2D>);
    return this;
  }

  measureTextWidth(text: string): number {
    return this.context.measureText(text).width;
  }

  scale(x: number, y: number): void {
    this.context.scale(x, y);
  }

  stroke(): CanvasService {
    this.context.stroke();
    return this;
  }

  // without invoke stroke
  // used to draw multiple lines, invoke stroke at last to enhance performance
  preLine(...points: Cord[]): CanvasService {
    if (points.length > 1) {
      const [start, ...rest] = points;
      this.context.moveTo(start[0], start[1]);
      for (const p of rest) {
        this.context.lineTo(p[0], p[1]);
      }
    }
    return this;
  }

  line(...points: Cord[]): CanvasService {
    if (points.length > 1) {
      const [start, ...rest] = points;
      this.context.moveTo(start[0], start[1]);
      for (const p of rest) {
        this.context.lineTo(p[0], p[1]);
      }
      this.context.stroke();
    }
    return this;
  }

  rect(left: number, top: number, width: number, height: number): void {
    this.context.rect(left, top, width, height);
  }

  fillRect(left: number, top: number, width: number, height: number): void {
    this.context.fillRect(left, top, width, height);
  }

  fill(): void {
    this.context.fill();
  }

  drawRect({
    left,
    top,
    width,
    height,
    willClip,
    background,
    border,
  }: CellRectParams): void {
    // draw borders
    this.save();
    const leftBorder = border.left;
    const rightBorder = border.right;
    const topBorder = border.top;
    const bottomBorder = border.bottom;
    if (leftBorder) {
      this.beginPath();
      this.setBorder(leftBorder);
      this.line(
        [left - GRID_LINE_WIDTH / 2, top - GRID_LINE_WIDTH / 2],
        [left - GRID_LINE_WIDTH / 2, top + height + GRID_LINE_WIDTH],
      );
    }
    if (rightBorder) {
      this.beginPath();
      this.setBorder(rightBorder);
      this.line(
        [left + width + GRID_LINE_WIDTH / 2, top - GRID_LINE_WIDTH / 2],
        [left + width + GRID_LINE_WIDTH / 2, top + height + GRID_LINE_WIDTH],
      );
    }
    if (topBorder) {
      this.beginPath();
      this.setBorder(topBorder);
      this.line(
        [left - GRID_LINE_WIDTH, top - GRID_LINE_WIDTH / 2],
        [left + width + GRID_LINE_WIDTH, top - GRID_LINE_WIDTH / 2],
      );
    }
    if (bottomBorder) {
      this.beginPath();
      this.setBorder(bottomBorder);
      this.line(
        [left - GRID_LINE_WIDTH, top + height + GRID_LINE_WIDTH / 2],
        [left + width + GRID_LINE_WIDTH, top + height + GRID_LINE_WIDTH / 2],
      );
    }
    this.restore();

    this.setStyle({
      strokeStyle: 'transparent',
      fillStyle: background,
      lineWidth: DEFAULT_BORDER_WIDTH,
    });
    this.beginPath();
    this.context.rect(
      left + CELL_PADDING,
      top + CELL_PADDING,
      width - 2 * CELL_PADDING,
      height - 2 * CELL_PADDING,
    );
    this.context.fill();
    if (willClip) {
      this.context.clip();
    }
  }

  private setBorder(b: Border): void {
    this.context.strokeStyle = b.color;
    switch (b.type) {
      case 'bold':
        this.context.lineWidth = 3;
        break;
      case 'medium':
        this.context.lineWidth = 2;
        break;
      case 'thin':
      default:
        this.context.lineWidth = 1;
    }
  }

  fillText(val: string, x: number, y: number): CanvasService {
    this.context.fillText(val, x, y);
    return this;
  }

  save(): CanvasService {
    this.context.save();
    return this;
  }

  translate(x: number, y: number): CanvasService {
    this.context.translate(x, y);
    return this;
  }

  restore(): CanvasService {
    this.context.restore();
    return this;
  }

  clear(): CanvasService {
    const { width, height } = this.el;
    this.context.clearRect(0, 0, width, height);
    return this;
  }

  beginPath(): CanvasService {
    this.context.beginPath();
    return this;
  }
}
