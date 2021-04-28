import { Injectable } from '@angular/core';
import { Selector } from '../core/selector.factory';
import { Rect } from '../models';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AutofillService {
  private preBuiltSelector!: Selector;
  private startX!: number;
  private startY!: number;
  private _autofillChanged$ = new Subject<Rect | null>();
  private isAutoFilling = false;

  // autofill rect
  public rect: Rect | null = null;

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
      console.log(this.preBuiltSelector.range);
      console.log(this.rect);
      this.rect = null;
      this._autofillChanged$.next(this.rect);
      this.isAutoFilling = false;
    }
  }
}
