import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { LocatedRect } from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-selector-container',
  templateUrl: './selector-container.component.html',
  styleUrls: ['./selector-container.component.scss'],
})
export class SelectorContainerComponent implements OnInit {
  @HostBinding('class.lyra-sheet-selector-container') h = true;

  rects: LocatedRect[] = [];
  autofillRect: LocatedRect | null = null;

  constructor(private c: BaseContainer, private el: ElementRef<HTMLElement>) {
    this.el.nativeElement.style.left = `${this.c.configService.ciw}px`;
    this.el.nativeElement.style.top = `${this.c.configService.rih}px`;
  }

  ngOnInit(): void {
    combineLatest([
      this.c.dataService.selectorChanged$,
      // todo: can be optimized into resizerFinished$
      this.c.resizerService.colResizer$,
      this.c.resizerService.rowResizer$,
      this.c.scrollingService.scrolled$,
    ]).subscribe(([selectors]) => {
      this.rects = selectors.map((s) =>
        this.c.viewRangeService.locateRect(s.range),
      );
    });

    this.c.autofillService.autofillChanged$.subscribe((rect) => {
      if (rect) {
        this.autofillRect = this.c.viewRangeService.locateRect(rect);
      } else {
        this.autofillRect = null;
      }
    });
  }
}
