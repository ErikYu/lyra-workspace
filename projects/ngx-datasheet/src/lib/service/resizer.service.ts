import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataService } from '../core/data.service';

type ColResizerLeft = number | null;
type RowResizerTop = number | null;

@Injectable()
export class ResizerService {
  colIndex: number | null = null;
  rowIndex: number | null = null;
  private deltaX = 0;
  private deltaY = 0;
  get colResizer$(): Observable<ColResizerLeft> {
    return this._colResizer$.asObservable();
  }
  get rowResizer$(): Observable<RowResizerTop> {
    return this._rowResizer$.asObservable();
  }
  private _colResizer$ = new BehaviorSubject<ColResizerLeft>(null);
  private _rowResizer$ = new BehaviorSubject<RowResizerTop>(null);

  constructor(private dataService: DataService) {}

  showColResizer(offsetLeft: number, colIndex: number): ResizerService {
    this._colResizer$.next(offsetLeft);
    this.colIndex = colIndex;
    this.deltaX = 0;
    return this;
  }

  showRowResizer(offsetTop: number, rowIndex: number): ResizerService {
    this._rowResizer$.next(offsetTop);
    this.rowIndex = rowIndex;
    this.deltaY = 0;
    return this;
  }

  moveColResizer(movementX: number): ResizerService {
    const oldWidth = this.dataService.selectedSheet.getColWidth(this.colIndex!);
    if (oldWidth + this.deltaX + movementX >= 5) {
      this.deltaX += movementX;
      this._colResizer$.next(this._colResizer$.value! + movementX);
    }
    return this;
  }

  moveRowResizer(movementY: number): ResizerService {
    const oldHeight = this.dataService.selectedSheet.getRowHeight(
      this.rowIndex!,
    );
    if (oldHeight + this.deltaY + movementY >= 5) {
      this.deltaY += movementY;
      this._rowResizer$.next(this._rowResizer$.value! + movementY);
    }
    return this;
  }

  pinColResizer(): ResizerService {
    this.dataService.selectedSheet.resizeColWidth(this.colIndex!, this.deltaX);
    return this;
  }

  hideColResizer(): ResizerService {
    this._colResizer$.next(null);
    this.colIndex = null;
    this.deltaX = 0;
    return this;
  }

  pinRowResizer(): ResizerService {
    this.dataService.selectedSheet.resizeRowHeight(this.rowIndex!, this.deltaY);
    return this;
  }

  hideRowResizer(): ResizerService {
    this._rowResizer$.next(null);
    this.colIndex = null;
    this.deltaY = 0;
    return this;
  }
}
