import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ScrollingService {
  vScrollbarShouldGoto = new Subject<number>();
  hScrollbarShouldGoto = new Subject<number>();
  get rowIndex(): number {
    return this._rowIndex;
  }

  get colIndex(): number {
    return this._colIndex;
  }

  private _rowIndex = 0;
  private _colIndex = 0;

  setRowIndex(ri: number): void {
    this._rowIndex = ri;
  }

  setColIndex(ci: number): void {
    this._colIndex = ci;
  }

  resetScrollAt(): void {
    this._rowIndex = 0;
    this._colIndex = 0;
  }
}
