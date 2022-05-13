import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { BaseContainer } from '../../services/_base_container';
import {
  ConfigService,
  DataService,
  RenderProxyService,
  ScrollingService,
  ViewRangeService,
} from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-scrollbar-v',
  templateUrl: './scrollbar-v.component.html',
  styleUrls: ['./scrollbar-v.component.scss'],
  host: { class: 'lyra-sheet-scrollbar lyra-sheet-scrollbar-v' },
})
export class ScrollbarVComponent implements OnInit, AfterViewInit {
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

  //
  @HostListener('scroll', ['$event'])
  onScroll(evt: MouseEvent): void {
    const { scrollTop } = evt.target as HTMLElement;
    const targetRi = this.dataService.selectedSheet.getRowIndex(scrollTop);
    // NOTICE:
    // `setRowIndex` should be called after `setRowRange`
    // as scroll will trigger selectors rerender, rerender requires latest viewRange
    // related to /components/selector-container/selector-container.component.ts line 39
    this.viewRangeService.setRowRange(targetRi, scrollTop);
    this.scrolling.setRowIndex(targetRi);
    this.dataService.rerender();
  }

  ngOnInit(): void {
    this.configService.config$.subscribe(({ row }) => {
      this.render.setStyle(
        this.el.nativeElement,
        'top',
        `${row.indexHeight - 0.5}px`,
      );
      this.render.setStyle(
        this.el.nativeElement,
        'width',
        `${this.configService.scrollbarThick}px`,
      );
      this.render.setStyle(
        this.el.nativeElement,
        'bottom',
        `${
          this.configService.scrollbarThick + this.configService.tabBarHeight
        }px`,
      );
    });
    this.scrolling.vScrollbarShouldGoto.asObservable().subscribe((vDelta) => {
      const vScrollNEl = this.el.nativeElement;
      const top = vDelta === 0 ? 0 : vScrollNEl.scrollTop + vDelta;
      vScrollNEl.scrollTo({ top });
    });
  }

  ngAfterViewInit(): void {
    this.renderProxyService.shouldRender$.subscribe(() => {
      this.mocker.nativeElement.style.height = `${this.dataService.selectedSheet.getTotalHeight()}px`;
    });
  }
}
