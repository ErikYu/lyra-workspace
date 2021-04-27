import { Injectable } from '@angular/core';
import { CellRange } from '../core/cell-range.factory';
import { Selector } from '../core/selector.factory';

@Injectable()
export class AutofillService {
  private preBuiltSelector!: Selector;
  private startX!: number;
  private startY!: number;

  // autofill rect
  private range!: CellRange;

  initAutofill(selector: Selector, evt: MouseEvent): void {
    this.preBuiltSelector = selector;
    this.startX = evt.offsetX;
    this.startY = evt.offsetY;
  }

  moveAutofill(): void {

  }


}
