import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter, map, pairwise, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ViewRangeService } from './view-range.service';
import { DataService } from './data.service';
import { ResizerService } from './resizer.service';
import { CONTEXTMENU_WIDTH, ResizerThickness } from '../constants';
import { HistoryService } from './history.service';
import { TextInputService } from './text-input.service';
import { ContextmenuService } from './contextmenu.service';
import { FormulaEditService } from './formula-edit.service';
import { labelFromCell } from '../utils';
import { ExecCommandService } from './exec-command.service';
import { AutofillService } from './autofill.service';
import { Lifecycle, scoped } from 'tsyringe';
import { ElementRefService } from './element-ref.service';

@scoped(Lifecycle.ContainerScoped)
export class MouseEventService {
  isSelecting = false;
  isAutoFilling = false;
  selectStartAt: [number | undefined, number | undefined] | null = null; // [ci, ri]

  isColResizing$ = new BehaviorSubject(false);
  isRowResizing$ = new BehaviorSubject(false);

  constructor(
    private configService: ConfigService,
    private viewRangeService: ViewRangeService,
    private dataService: DataService,
    private resizerService: ResizerService,
    private historyService: HistoryService,
    private textInputService: TextInputService,
    private contextmenuService: ContextmenuService,
    private formulaEditService: FormulaEditService,
    private command: ExecCommandService,
    private autofillService: AutofillService,
    private elRef: ElementRefService,
  ) {}

  initDomElements(): void {
    fromEvent<MouseEvent>(this.elRef.maskEl, 'mousedown')
      .pipe(filter((evt) => evt.which === 1 || evt.which === 3))
      .subscribe((mouseDownEvent) => {
        mouseDownEvent.preventDefault();
        if (mouseDownEvent.detail === 1) {
          const isAutofill = (
            mouseDownEvent.target as HTMLElement
          ).classList.contains('lyra-sheet-selector-autofill');

          if (isAutofill) {
            this.isAutoFilling = true;
            this.autofillService.showAutofill(
              this.dataService.selectedSheet.last,
              mouseDownEvent,
            );
            return;
          }

          if (mouseDownEvent.which === 1) {
            this.isSelecting = true;
          }
          if (
            mouseDownEvent.which === 3 &&
            this.dataService.selectedSheet.isNotEmpty
          ) {
            // check if click on one selector, if so, just display contextmenu without selecting cell
            const mouseLeft = mouseDownEvent.offsetX - this.configService.ciw;
            const mouseTop = mouseDownEvent.offsetY - this.configService.rih;
            const { left, top, width, height } =
              this.viewRangeService.locateRect(
                this.dataService.selectedSheet.last.range,
              );
            if (
              left <= mouseLeft &&
              mouseLeft <= left + width &&
              top <= mouseTop &&
              mouseTop <= top + height
            ) {
              return;
            }
          }

          const { hitRowIndex, hitColIndex } = this.getHitCell(mouseDownEvent);
          this.selectStartAt = [hitColIndex, hitRowIndex];
          // draw box
          if (hitRowIndex !== undefined && hitColIndex !== undefined) {
            const hitMerge = this.dataService.selectedSheet.getHitMerge(
              hitRowIndex,
              hitColIndex,
            );
            this.dataService.selectedSheet.removeAll();
            if (hitMerge) {
              this.dataService.selectedSheet.addRange(
                hitMerge.sri,
                hitMerge.eri,
                hitMerge.sci,
                hitMerge.eci,
              );
            } else {
              this.dataService.selectedSheet.addOne(hitRowIndex, hitColIndex);
            }
          } else if (hitRowIndex !== undefined && hitColIndex === undefined) {
            this.dataService.selectedSheet.removeAll();
            this.dataService.selectedSheet.addWholeRow(hitRowIndex);
          } else if (hitRowIndex === undefined && hitColIndex !== undefined) {
            this.dataService.selectedSheet.removeAll();
            this.dataService.selectedSheet.addWholeColumn(hitColIndex);
          } else {
            this.dataService.selectedSheet.removeAll();
            this.dataService.selectedSheet.addAll();
          }
          if (!this.textInputService.isEditing) {
            this.textInputService.hide();
          } else {
            if (this.formulaEditService.activated) {
              let label = '';
              if (hitRowIndex !== undefined && hitColIndex !== undefined) {
                label = labelFromCell(hitRowIndex, hitColIndex);
              }
              if (this.formulaEditService.shouldInsert) {
                this.command.insertText(label);
              } else {
                this.textInputService.hide();
              }
            } else {
              this.textInputService.hide();
            }
          }
        } else if (mouseDownEvent.detail === 2 && mouseDownEvent.which === 1) {
          if (this.dataService.selectedSheet.selectors.length > 0) {
            const lastSelector = this.dataService.selectedSheet.last;
            if (lastSelector.range.isSingleCell) {
              // double click -> activate cell edit
              this.textInputService.show(false);
              this.textInputService.focus('last');
            } else {
              // double click on row / col index, auto resize
              const { sri, eri, sci, eci } = lastSelector.range;
              if (sri === eri) {
                this.historyService.stacked(() => {
                  this.dataService.selectedSheet.adaptiveRowHeight(sri);
                });
                this.dataService.rerender();
              } else if (sci === eci) {
                this.historyService.stacked(() => {
                  this.dataService.selectedSheet.adaptiveColumnWidth(sci);
                });
                this.dataService.rerender();
              }
            }
          }
        }
      });

    fromEvent<MouseEvent>(this.elRef.maskEl, 'contextmenu')
      .pipe(
        tap((evt) => {
          evt.preventDefault();
          const xLeft =
            this.elRef.maskEl.getBoundingClientRect().width - evt.offsetX;
          if (xLeft < CONTEXTMENU_WIDTH) {
            this.contextmenuService.show(
              evt.offsetX - CONTEXTMENU_WIDTH,
              evt.offsetY,
            );
          } else {
            this.contextmenuService.show(evt.offsetX, evt.offsetY);
          }
        }),
      )
      .subscribe();

    fromEvent<MouseEvent>(this.elRef.maskEl, 'mousemove')
      .pipe(
        filter((mouseMoveEvent) => {
          if (this.isAutoFilling) {
            const cell = this.getHitCell(mouseMoveEvent);
            this.autofillService.moveAutofill(
              cell.hitRowIndex!,
              cell.hitColIndex!,
              mouseMoveEvent,
            );
          }
          return !this.isAutoFilling;
        }),
        filter((mouseMoveEvent) => {
          if (!this.isSelecting) {
            if (this.isColResizing$.value) {
              this.resizerService.moveColResizer(mouseMoveEvent);
            } else if (this.isRowResizing$.value) {
              this.resizerService.moveRowResizer(mouseMoveEvent);
            } else {
              const inMask = mouseMoveEvent.target === this.elRef.maskEl;
              if (!inMask) {
                this.resizerService.hideColResizer().hideRowResizer();
              } else {
                const isInRowHeader =
                  mouseMoveEvent.offsetY <= this.configService.rih;
                const isInColIndex =
                  mouseMoveEvent.offsetX <= this.configService.ciw;
                if (isInColIndex && isInRowHeader) {
                  // ignore me
                } else if (isInRowHeader) {
                  const { right, colIndex } =
                    this.viewRangeService.cellRange.colIndexAt(
                      this.dataService.selectedSheet,
                      mouseMoveEvent.offsetX - this.configService.ciw,
                    );
                  this.resizerService
                    .hideRowResizer()
                    .showColResizer(
                      right + this.configService.ciw - ResizerThickness,
                      colIndex,
                    );
                } else if (isInColIndex) {
                  const { bottom, rowIndex } =
                    this.viewRangeService.cellRange.rowIndexAt(
                      this.dataService.selectedSheet,
                      mouseMoveEvent.offsetY - this.configService.rih,
                    );
                  this.resizerService
                    .hideColResizer()
                    .showRowResizer(
                      bottom + this.configService.rih - ResizerThickness,
                      rowIndex,
                    );
                } else {
                  this.resizerService.hideRowResizer().hideColResizer();
                }
              }
            }
          }
          return this.isSelecting;
        }),
        map((mouseMoveEvent) => ({
          ...this.getHitCell(mouseMoveEvent),
        })),
        pairwise(),
        filter(([before, after]) => {
          return (
            before.hitColIndex !== after.hitColIndex ||
            before.hitRowIndex !== after.hitRowIndex
          );
        }),
        map(([, after]) => after),
      )
      .subscribe(({ hitRowIndex, hitColIndex }) => {
        // should only trigger when move out current cell
        const [startCI, startRI] = this.selectStartAt!;
        if (startCI === hitColIndex && startRI === hitRowIndex) {
          return;
        }
        if (startRI !== undefined && startCI !== undefined) {
          // cell range select
          if (hitRowIndex !== undefined && hitColIndex !== undefined) {
            this.dataService.selectedSheet.lastResizeTo(
              hitRowIndex,
              hitColIndex,
            );
          }
        } else if (startRI !== undefined && startCI === undefined) {
          // row range select
          if (hitRowIndex !== undefined) {
            this.dataService.selectedSheet.lastResizeTo(hitRowIndex, undefined);
          }
        } else if (startRI === undefined && startCI !== undefined) {
          // col range select
          if (hitColIndex !== undefined) {
            this.dataService.selectedSheet.lastResizeTo(undefined, hitColIndex);
          }
        }
      });

    fromEvent<MouseEvent>(this.elRef.colResizer, 'mousedown').subscribe(
      (evt) => {
        this.isColResizing$.next(true);
        this.resizerService.startDrag(evt);
      },
    );

    fromEvent<MouseEvent>(this.elRef.rowResizer, 'mousedown').subscribe(
      (evt) => {
        this.isRowResizing$.next(true);
        this.resizerService.startDrag(evt);
      },
    );

    fromEvent(this.elRef.rootEl, 'mouseup').subscribe(() => {
      if (this.isColResizing$.value) {
        this.isColResizing$.next(false);
        this.historyService.stacked(() => {
          this.resizerService.pinColResizer().hideColResizer();
        });
        this.dataService.rerender();
      }
      if (this.isRowResizing$.value) {
        this.isRowResizing$.next(false);
        this.historyService.stacked(() => {
          this.resizerService.pinRowResizer().hideRowResizer();
        });
        this.dataService.rerender();
      }
      this.isSelecting = false;
      this.selectStartAt = null;
      this.isAutoFilling = false;
      this.autofillService.hideAutofill();
    });
  }

  private getHitCell(evt: MouseEvent): {
    hitRowIndex: number | undefined;
    hitColIndex: number | undefined;
  } {
    let hitRowIndex!: number;
    let hitColIndex!: number;
    const { rih, ciw } = this.configService;
    const { cellRange: viewRange } = this.viewRangeService;
    const { offsetY, offsetX } = this.offsetRelatedTo(evt, rih, ciw);
    if (offsetY > 0) {
      ({ rowIndex: hitRowIndex } = viewRange.rowIndexAt(
        this.dataService.selectedSheet,
        offsetY,
      ));
    }
    if (offsetX > 0) {
      ({ colIndex: hitColIndex } = viewRange.colIndexAt(
        this.dataService.selectedSheet,
        offsetX,
      ));
    }
    return {
      hitRowIndex,
      hitColIndex,
    };
  }

  private offsetRelatedTo(
    evt: MouseEvent,
    rowIndexHeight: number,
    colIndexWidth: number,
  ): {
    offsetY: number;
    offsetX: number;
  } {
    return {
      offsetX: evt.offsetX - colIndexWidth,
      offsetY: evt.offsetY - rowIndexHeight,
    };
  }
}
