import { BehaviorSubject, Observable } from 'rxjs';
import { DataService } from './data.service';
import { Lifecycle, scoped } from 'tsyringe';

type ColResizerLeft = number | null;
type RowResizerTop = number | null;

@scoped(Lifecycle.ContainerScoped)
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

  private startX = 0;
  private startY = 0;

  constructor(private dataService: DataService) {}

  startDrag(evt: MouseEvent) {
    this.startX = evt.clientX;
    this.startY = evt.clientY;
  }

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

  moveColResizer(evt: MouseEvent): ResizerService {
    const movementX = evt.clientX - this.startX;
    const oldWidth = this.dataService.selectedSheet.getColWidth(this.colIndex!);
    if (oldWidth + this.deltaX + movementX >= 5) {
      this.deltaX += movementX;
      this._colResizer$.next(this._colResizer$.value! + movementX);
      this.startX = evt.clientX;
    }
    return this;
  }

  moveRowResizer(evt: MouseEvent): ResizerService {
    const movementY = evt.clientY - this.startY;
    const oldHeight = this.dataService.selectedSheet.getRowHeight(
      this.rowIndex!,
    );
    if (oldHeight + this.deltaY + movementY >= 5) {
      this.deltaY += movementY;
      this._rowResizer$.next(this._rowResizer$.value! + movementY);
      this.startY = evt.clientY;
    }
    return this;
  }

  pinColResizer(): ResizerService {
    this.dataService.selectedSheet.resizeColWidth(this.colIndex!, this.deltaX);
    return this;
  }

  hideColResizer(): ResizerService {
    if (this._colResizer$.value !== null) {
      this._colResizer$.next(null);
      this.colIndex = null;
      this.deltaX = 0;
      this.startX = 0;
    }
    return this;
  }

  pinRowResizer(): ResizerService {
    this.dataService.selectedSheet.resizeRowHeight(this.rowIndex!, this.deltaY);
    return this;
  }

  hideRowResizer(): ResizerService {
    if (this._rowResizer$.value !== null) {
      this._rowResizer$.next(null);
      this.colIndex = null;
      this.deltaY = 0;
      this.startY = 0;
    }
    return this;
  }
}
