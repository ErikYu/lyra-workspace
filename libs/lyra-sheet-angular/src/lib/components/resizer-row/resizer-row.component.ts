import { Component, ElementRef, OnInit } from '@angular/core';
import { ResizerThickness } from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-resizer-row',
  templateUrl: './resizer-row.component.html',
  styleUrls: ['./resizer-row.component.scss'],
  host: {
    class: 'lyra-sheet-resizer lyra-sheet-resizer-row',
  },
})
export class ResizerRowComponent implements OnInit {
  readonly staticStyle = {
    height: `${ResizerThickness}px`,
    width: `${this.c.configService.ciw}px`,
  };

  readonly lineStyle = {
    width: `calc(100% - ${this.c.configService.ciw}px)`,
    transform: `translateY(-${Math.ceil(ResizerThickness / 2)}px)`,
  };
  constructor(private el: ElementRef<HTMLElement>, public c: BaseContainer) {}

  ngOnInit(): void {
    this.c.resizerService.rowResizer$.subscribe((top) => {
      if (top === null) {
        this.el.nativeElement.style.display = 'none';
      } else {
        this.el.nativeElement.style.display = 'block';
        this.el.nativeElement.style.top = `${top}px`;
      }
    });
  }
}
