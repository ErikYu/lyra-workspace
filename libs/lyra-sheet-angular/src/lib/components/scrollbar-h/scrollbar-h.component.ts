import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  ConfigService,
  DataService,
  RenderProxyService,
  ScrollingService,
  ViewRangeService,
} from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-scrollbar-h',
  templateUrl: './scrollbar-h.component.html',
  styleUrls: ['./scrollbar-h.component.scss'],
  host: { class: 'lyra-sheet-scrollbar lyra-sheet-scrollbar-h' },
})
export class ScrollbarHComponent implements OnInit, AfterViewInit {
  @ViewChild('mocker') mocker!: ElementRef<HTMLElement>;
  private configService: ConfigService;
  private dataService: DataService;
  private scrolling: ScrollingService;
  private viewRangeService: ViewRangeService;
  private renderProxyService: RenderProxyService;
  constructor(
    private el: ElementRef<HTMLElement>,
    private render: Renderer2,
    private c: BaseContainer,
  ) {
    this.configService = this.c.configService;
    this.dataService = this.c.dataService;
    this.scrolling = this.c.scrollingService;
    this.viewRangeService = this.c.viewRangeService;
    this.renderProxyService = this.c.renderProxyService;
  }

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
