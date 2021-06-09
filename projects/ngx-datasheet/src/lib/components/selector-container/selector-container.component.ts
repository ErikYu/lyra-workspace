import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { SelectorsService } from '../../core/selectors.service';
import { ViewRangeService } from '../../core/view-range.service';
import { combineLatest } from 'rxjs';
import { ResizerService } from '../../service/resizer.service';
import { LocatedRect } from '../../models';
import { ScrollingService } from '../../core/scrolling.service';

@Component({
  selector: 'nd-selector-container',
  templateUrl: './selector-container.component.html',
  styleUrls: ['./selector-container.component.less'],
})
export class SelectorContainerComponent implements OnInit {
  @HostBinding('class.nd-selector-container') h = true;

  rects: LocatedRect[] = [];

  constructor(
    private selectorRangeService: SelectorsService,
    private v: ViewRangeService,
    private el: ElementRef<HTMLElement>,
    private r: ResizerService,
    private s: ScrollingService,
  ) {
    this.el.nativeElement.style.left = '60px';
    this.el.nativeElement.style.top = '25px';
  }

  ngOnInit(): void {
    combineLatest([
      this.selectorRangeService.selectorChanged,
      // todo: can be optimized into resizerFinished$
      this.r.colResizer$,
      this.r.rowResizer$,
      this.s.scrolled$,
    ]).subscribe(([selectors]) => {
      this.rects = selectors.map((s) => this.v.locateRect(s.range));
    });
  }
}
