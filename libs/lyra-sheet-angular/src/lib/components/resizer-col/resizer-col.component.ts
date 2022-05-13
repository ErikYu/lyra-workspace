import { Component, ElementRef, OnInit } from '@angular/core';
import { ResizerThickness } from '@lyra-sheet/core';
import { BaseContainer } from '../../services/_base_container';

@Component({
  selector: 'lyra-sheet-resizer-col',
  templateUrl: './resizer-col.component.html',
  styleUrls: ['./resizer-col.component.scss'],
  host: {
    class: 'lyra-sheet-resizer lyra-sheet-resizer-col',
  },
})
export class ResizerColComponent implements OnInit {
  readonly headerStaticStyle = {
    width: `${ResizerThickness}px`,
    height: `${this.c.configService.rih}px`,
  };

  readonly lineStyle = {
    height: `calc(100% - ${this.c.configService.rih}px)`,
    transform: `translateX(${Math.floor(ResizerThickness / 2)}px)`,
  };
  constructor(private el: ElementRef<HTMLElement>, public c: BaseContainer) {}

  ngOnInit(): void {
    this.c.resizerService.colResizer$.subscribe((left) => {
      if (left === null) {
        this.el.nativeElement.style.display = 'none';
      } else {
        this.el.nativeElement.style.display = 'block';
        this.el.nativeElement.style.left = `${left}px`;
      }
    });
  }
}
