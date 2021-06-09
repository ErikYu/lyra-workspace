import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ConfigService } from '../../core/config.service';
import { ScrollingService } from '../../core/scrolling.service';
import { DataService } from '../../core/data.service';
import { ViewRangeService } from '../../core/view-range.service';
import { RenderProxyService } from '../../service/render-proxy.service';

@Component({
  selector: 'nd-scrollbar-h',
  templateUrl: './scrollbar-h.component.html',
  styleUrls: ['./scrollbar-h.component.less'],
  host: { class: 'nd-scrollbar nd-scrollbar-h' },
})
export class ScrollbarHComponent implements OnInit, AfterViewInit {
  @ViewChild('mocker') mocker!: ElementRef<HTMLElement>;
  constructor(
    private el: ElementRef<HTMLElement>,
    private render: Renderer2,
    private configService: ConfigService,
    private scrolling: ScrollingService,
    private dataService: DataService,
    private viewRangeService: ViewRangeService,
    private renderProxyService: RenderProxyService,
  ) {}

  @HostListener('scroll', ['$event'])
  onScroll(evt: MouseEvent): void {
    const { scrollLeft } = evt.target as HTMLElement;
    const targetCi = this.dataService.selectedSheet.getColIndex(scrollLeft);
    this.viewRangeService.setColRange(targetCi, scrollLeft);
    this.scrolling.setColIndex(targetCi);
    this.dataService.rerender();
  }

  ngOnInit(): void {
    this.render.setStyle(
      this.el.nativeElement,
      'left',
      `${this.configService.ciw}px`,
    );
    this.render.setStyle(
      this.el.nativeElement,
      'right',
      `${this.configService.scrollbarThick}px`,
    );
    this.render.setStyle(
      this.el.nativeElement,
      'bottom',
      `${this.configService.tabBarHeight}px`,
    );
    this.render.setStyle(
      this.el.nativeElement,
      'height',
      `${this.configService.scrollbarThick}px`,
    );
    this.scrolling.hScrollbarShouldGoto.asObservable().subscribe((hDelta) => {
      const hScrollNEl = this.el.nativeElement;
      const left = hDelta === 0 ? 0 : hScrollNEl.scrollLeft + hDelta;
      hScrollNEl.scrollTo({ left });
    });
  }

  ngAfterViewInit(): void {
    this.renderProxyService.shouldRender$.subscribe(() => {
      this.mocker.nativeElement.style.width = `${this.dataService.selectedSheet.getTotalWidth()}px`;
    });
  }
}
