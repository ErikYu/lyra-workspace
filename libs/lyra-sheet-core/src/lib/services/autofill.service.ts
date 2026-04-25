import { Selector } from './selector.factory';
import { Rect, RichTextLine } from '../types';
import { Observable, Subject } from 'rxjs';
import { Lifecycle, scoped } from 'tsyringe';
import { DataService } from './data.service';
import { HistoryService } from './history.service';
import { cloneDeep } from '../utils';

@scoped(Lifecycle.ContainerScoped)
export class AutofillService {
  private preBuiltSelector!: Selector;
  private startX!: number;
  private startY!: number;
  private _autofillChanged$ = new Subject<Rect | null>();
  private isAutoFilling = false;

  // autofill rect
  public rect: Rect | null = null;

  constructor(
    private dataService: DataService,
    private historyService: HistoryService,
  ) {}

  get autofillChanged$(): Observable<Rect | null> {
    return this._autofillChanged$.asObservable();
  }

  showAutofill(selector: Selector, evt: MouseEvent): void {
    this.isAutoFilling = true;
    this.preBuiltSelector = selector;
    const target: HTMLElement = evt.target as HTMLElement;
    this.startX = evt.offsetX + target.offsetLeft;
    this.startY = evt.offsetY + target.offsetTop;
  }

  moveAutofill(ri: number, ci: number, evt: MouseEvent): void {
    const { offsetX, offsetY } = evt;
    const deltaX = offsetX - this.startX;
    const deltaY = offsetY - this.startY;
    if (deltaX > 0 || deltaY > 0) {
      if (deltaX <= deltaY) {
        // vertical format
        this.rect = {
          sri: this.preBuiltSelector.range.eri + 1,
          sci: this.preBuiltSelector.range.sci,
          eri: ri,
          eci: this.preBuiltSelector.range.eci,
        };
        this._autofillChanged$.next(this.rect);
      } else {
        // horizontal format
        this.rect = {
          sri: this.preBuiltSelector.range.sri,
          sci: this.preBuiltSelector.range.eci + 1,
          eri: this.preBuiltSelector.range.eri,
          eci: ci,
        };
        this._autofillChanged$.next(this.rect);
      }
    }
  }

  hideAutofill(): void {
    if (this.isAutoFilling) {
      if (this.rect) {
        this.applyAutofill(this.preBuiltSelector, this.rect);
      }
      this.rect = null;
      this._autofillChanged$.next(this.rect);
      this.isAutoFilling = false;
    }
  }

  applyAutofill(sourceSelector: Selector, targetRange: Rect): void {
    const selectedSheet = this.dataService.selectedSheet;
    const sourceRange = sourceSelector.range;
    const series = this.buildVerticalNumericSeries(sourceRange, targetRange);

    this.historyService.stacked(
      () => {
        for (let ri = targetRange.sri; ri <= targetRange.eri; ri += 1) {
          for (let ci = targetRange.sci; ci <= targetRange.eci; ci += 1) {
            const richText = series
              ? [[{ text: `${series.first + series.step * (ri - sourceRange.sri)}` }]]
              : this.getCopiedRichText(sourceRange, ri, ci);
            selectedSheet.applyRichTextToCell(ri, ci, richText);
          }
        }
      },
      {
        si: this.dataService.selectedIndex,
        ri: targetRange.sri,
        ci: targetRange.sci,
      },
    );
    this.dataService.rerender();
  }

  private buildVerticalNumericSeries(
    sourceRange: Rect,
    targetRange: Rect,
  ): { first: number; step: number } | null {
    const sourceHeight = sourceRange.eri - sourceRange.sri + 1;
    const sourceWidth = sourceRange.eci - sourceRange.sci + 1;
    const targetWidth = targetRange.eci - targetRange.sci + 1;
    if (sourceHeight < 2 || sourceWidth !== 1 || targetWidth !== 1) {
      return null;
    }

    const first = Number(
      this.dataService.selectedSheet.getCellPlainText(
        sourceRange.sri,
        sourceRange.sci,
      ),
    );
    const second = Number(
      this.dataService.selectedSheet.getCellPlainText(
        sourceRange.sri + 1,
        sourceRange.sci,
      ),
    );
    if (Number.isNaN(first) || Number.isNaN(second)) {
      return null;
    }

    return { first, step: second - first };
  }

  private getCopiedRichText(
    sourceRange: Rect,
    targetRowIndex: number,
    targetColIndex: number,
  ): RichTextLine[] {
    const sourceHeight = sourceRange.eri - sourceRange.sri + 1;
    const sourceWidth = sourceRange.eci - sourceRange.sci + 1;
    const sourceRowIndex =
      sourceRange.sri + ((targetRowIndex - sourceRange.sri) % sourceHeight);
    const sourceColIndex =
      sourceRange.sci + ((targetColIndex - sourceRange.sci) % sourceWidth);
    return cloneDeep(
      this.dataService.selectedSheet.getCell(sourceRowIndex, sourceColIndex)
        ?.richText || [[]],
    );
  }
}
