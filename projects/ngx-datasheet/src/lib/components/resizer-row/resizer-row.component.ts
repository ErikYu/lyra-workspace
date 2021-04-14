import { Component, ElementRef, OnInit } from '@angular/core';
import { ResizerThickness } from '../../constants';
import { ResizerService } from '../../service/resizer.service';
import { ConfigService } from '../../core/config.service';
import { MouseEventService } from '../../service/mouse-event.service';

@Component({
  selector: 'nd-resizer-row',
  templateUrl: './resizer-row.component.html',
  styleUrls: ['./resizer-row.component.less'],
  host: {
    class: 'nd-resizer nd-resizer-row',
  },
})
export class ResizerRowComponent implements OnInit {
  readonly staticStyle = {
    height: `${ResizerThickness}px`,
    width: `${this.configService.ciw}px`,
  };

  readonly lineStyle = {
    width: `calc(100% - ${this.configService.ciw}px)`,
    transform: `translateY(-${Math.ceil(ResizerThickness / 2)}px)`,
  };
  constructor(
    private el: ElementRef<HTMLElement>,
    private resizerService: ResizerService,
    private configService: ConfigService,
    public mouseEventService: MouseEventService,
  ) {}

  ngOnInit(): void {
    this.resizerService.rowResizer$.subscribe((top) => {
      if (top === null) {
        this.el.nativeElement.style.display = 'none';
      } else {
        this.el.nativeElement.style.display = 'block';
        this.el.nativeElement.style.top = `${top}px`;
      }
    });
  }
}
