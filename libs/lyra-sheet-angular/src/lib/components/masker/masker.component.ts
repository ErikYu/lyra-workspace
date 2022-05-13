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
import { EditorService } from '@lyra-sheet/core';
import { ConfigService, ScrollingService } from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-masker',
  templateUrl: './masker.component.html',
  styleUrls: ['./masker.component.scss'],
  host: {
    class: 'lyra-sheet-editor-mask',
  },
})
export class MaskerComponent implements OnInit {
  private wheel$ = new Subject<WheelEvent>();
  private configService: ConfigService;
  private scrollingService: ScrollingService;
  private editorService: EditorService;
  constructor(
    private hostEl: ElementRef<HTMLDivElement>,
    private renderer: Renderer2,
    private c: BaseContainer,
  ) {
    this.configService = this.c.configService;
    this.scrollingService = this.c.scrollingService;
    this.editorService = this.c.editorService;
  }

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
