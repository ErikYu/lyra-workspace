import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Lifecycle, scoped } from 'tsyringe';

@scoped(Lifecycle.ContainerScoped)
export class ScrollingService {
  private _scrolled$ = new BehaviorSubject(true);
  get scrolled$(): Observable<unknown> {
    return this._scrolled$.asObservable();
  }
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
    this._scrolled$.next(true);
  }

  setColIndex(ci: number): void {
    this._colIndex = ci;
    this._scrolled$.next(true);
  }

  resetScrollAt(): void {
    this._rowIndex = 0;
    this._colIndex = 0;
  }
}
