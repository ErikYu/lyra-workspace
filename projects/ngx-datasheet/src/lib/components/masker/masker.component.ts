import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { map, tap, throttleTime } from 'rxjs/operators';
import { EditorService } from '../editor/editor.service';
import { ScrollingService } from '../../core/scrolling.service';
import { ViewRangeService } from '../../core/view-range.service';
import { SelectorsService } from '../../core/selectors.service';
import { ConfigService } from '../../core/config.service';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'nd-masker',
  templateUrl: './masker.component.html',
  styleUrls: ['./masker.component.less'],
})
export class MaskerComponent implements OnInit, AfterViewInit {
  @HostBinding('class.nd-editor-mask') enabled = true;
  @ViewChild('contentZone') contentZone!: ElementRef<HTMLElement>;
  private wheel$ = new Subject<WheelEvent>();
  private isMoving = false;

  constructor(
    private hostEl: ElementRef<HTMLDivElement>,
    private renderer: Renderer2,
    private configService: ConfigService,
    private editorService: EditorService,
    private scrollingService: ScrollingService,
    private viewRangeService: ViewRangeService,
    private dataService: DataService,
    public selectorRangeService: SelectorsService,
  ) {}

  @HostListener('wheel', ['$event'])
  onWheel(evt: WheelEvent): void {
    this.wheel$.next(evt);
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(evt: MouseEvent): void {
    // get iht cell
    if (evt.which === 1) {
      this.isMoving = true;
      const { hitRowIndex, hitColIndex } = this.getHitCell(evt);
      // draw box
      if (hitRowIndex !== undefined && hitColIndex !== undefined) {
        const hitMerge = this.dataService.selectedSheet.getHitMerge(
          hitRowIndex,
          hitColIndex,
        );
        this.selectorRangeService.removeAll();
        if (hitMerge) {
          this.selectorRangeService.addRange(
            hitMerge.sri,
            hitMerge.eri,
            hitMerge.sci,
            hitMerge.eci,
          );
        } else {
          this.selectorRangeService.addOne(hitRowIndex, hitColIndex);
        }
      } else if (hitRowIndex !== undefined && hitColIndex === undefined) {
        this.selectorRangeService.removeAll();
        this.selectorRangeService.addWholeRow(hitRowIndex);
      } else if (hitRowIndex === undefined && hitColIndex !== undefined) {
        this.selectorRangeService.removeAll();
        this.selectorRangeService.addWholeColumn(hitColIndex);
      } else {
        this.selectorRangeService.removeAll();
        this.selectorRangeService.addAll();
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMousemove(evt: MouseEvent): void {
    if (this.isMoving) {
      const { hitRowIndex, hitColIndex } = this.getHitCell(evt);
      if (hitRowIndex !== undefined && hitColIndex !== undefined) {
        this.selectorRangeService.lastResizeTo(hitRowIndex, hitColIndex);
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseup(): void {
    this.isMoving = false;
  }

  ngOnInit(): void {
    this.wheel$
      .asObservable()
      .pipe(
        tap((evt) => evt.preventDefault()),
        throttleTime(20),
        map((evt) => this.editorService.calcNextStepDelta(evt)),
      )
      .subscribe(({ hDelta, vDelta }) => {
        if (vDelta !== undefined) {
          this.scrollingService.vScrollbarShouldGoto.next(vDelta);
        }
        if (hDelta !== undefined) {
          this.scrollingService.hScrollbarShouldGoto.next(hDelta);
        }
      });
  }

  ngAfterViewInit(): void {
    this.contentZone.nativeElement.style.left = '60px';
    this.contentZone.nativeElement.style.top = '25px';
  }

  private getHitCell(
    evt: MouseEvent,
  ): {
    hitRowIndex: number | undefined;
    hitColIndex: number | undefined;
  } {
    let hitRowIndex!: number;
    let hitColIndex!: number;
    const { row, col } = this.configService.configuration;
    const { cellRange: viewRange } = this.viewRangeService;
    const { offsetY, offsetX } = this.offsetRelatedTo(
      evt,
      row.indexHeight,
      col.indexWidth,
    );
    if (offsetY > 0) {
      hitRowIndex = viewRange.rowIndexAt(
        this.dataService.selectedSheet,
        offsetY,
      );
    }
    if (offsetX > 0) {
      hitColIndex = viewRange.colIndexAt(
        this.dataService.selectedSheet,
        offsetX,
      );
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
    const target = evt.target as HTMLElement;
    if (target.classList.contains('nd-editor-mask')) {
      return {
        offsetX: evt.offsetX - colIndexWidth,
        offsetY: evt.offsetY - rowIndexHeight,
      };
    } else if (target.classList.contains('nd-selector-container')) {
      return {
        offsetX: evt.offsetX,
        offsetY: evt.offsetY,
      };
    } else {
      return {
        offsetX: evt.offsetX + target.offsetLeft,
        offsetY: evt.offsetY + target.offsetTop,
      };
    }
  }
}
