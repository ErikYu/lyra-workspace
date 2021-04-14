import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ResizerService } from '../../service/resizer.service';
import { ResizerThickness } from '../../constants';
import { ConfigService } from '../../core/config.service';
import { MouseEventService } from '../../service/mouse-event.service';

@Component({
  selector: 'nd-resizer-col',
  templateUrl: './resizer-col.component.html',
  styleUrls: ['./resizer-col.component.less'],
  host: {
    class: 'nd-resizer nd-resizer-col',
  },
})
export class ResizerColComponent implements OnInit {
  readonly headerStaticStyle = {
    width: `${ResizerThickness}px`,
    height: `${this.configService.rih}px`,
  };

  readonly lineStyle = {
    height: `calc(100% - ${this.configService.rih}px)`,
    transform: `translateX(${Math.floor(ResizerThickness / 2)}px)`,
  };
  constructor(
    private el: ElementRef<HTMLElement>,
    private resizerService: ResizerService,
    private configService: ConfigService,
    public mouseEventService: MouseEventService,
  ) {}

  ngOnInit(): void {
    this.resizerService.colResizer$.subscribe((left) => {
      if (left === null) {
        this.el.nativeElement.style.display = 'none';
      } else {
        this.el.nativeElement.style.display = 'block';
        this.el.nativeElement.style.left = `${left}px`;
      }
    });
  }
}
