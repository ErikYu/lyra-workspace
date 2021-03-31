import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subject } from 'rxjs';
import { map, tap, throttleTime } from 'rxjs/operators';
import { EditorService } from '../editor/editor.service';
import { ScrollingService } from '../../core/scrolling.service';
import { SelectorsService } from '../../core/selectors.service';
import { ConfigService } from '../../core/config.service';

@Component({
  selector: 'nd-masker',
  templateUrl: './masker.component.html',
  styleUrls: ['./masker.component.less'],
})
export class MaskerComponent implements OnInit {
  @HostBinding('class.nd-editor-mask') enabled = true;
  private wheel$ = new Subject<WheelEvent>();

  constructor(
    private hostEl: ElementRef<HTMLDivElement>,
    private renderer: Renderer2,
    private configService: ConfigService,
    private editorService: EditorService,
    private scrollingService: ScrollingService,
    public selectorRangeService: SelectorsService,
  ) {}

  @HostListener('wheel', ['$event'])
  onWheel(evt: WheelEvent): void {
    this.wheel$.next(evt);
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
}
