import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ConfigService } from '../../core/config.service';
import { DataService } from '../../core/data.service';
import { ScrollingService } from '../../core/scrolling.service';
import { ViewRangeService } from '../../core/view-range.service';
import { RenderProxyService } from '../../service/render-proxy.service';

@Component({
  selector: 'nd-scrollbar-v',
  templateUrl: './scrollbar-v.component.html',
  styleUrls: ['./scrollbar-v.component.less'],
  host: { class: 'nd-scrollbar nd-scrollbar-v' },
})
export class ScrollbarVComponent implements OnInit, AfterViewInit {
  @ViewChild('mocker') mocker!: ElementRef<HTMLElement>;
  constructor(
    private el: ElementRef<HTMLElement>,
    private render: Renderer2,
    private configService: ConfigService,
    private dataService: DataService,
    private scrolling: ScrollingService,
    private viewRangeService: ViewRangeService,
    private renderProxyService: RenderProxyService,
  ) {}

  //
  @HostListener('scroll', ['$event'])
  onScroll(evt: MouseEvent): void {
    const { scrollTop } = evt.target as HTMLElement;
    const targetRi = this.dataService.selectedSheet.getRowIndex(scrollTop);
    this.scrolling.setRowIndex(targetRi);
    this.viewRangeService.setRowRange(targetRi, scrollTop);
    this.dataService.rerender();
  }

  ngOnInit(): void {
    this.render.setStyle(
      this.el.nativeElement,
      'top',
      `${this.configService.configuration.row.indexHeight - 0.5}px`,
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
