import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'nd-resizer-col',
  templateUrl: './resizer-col.component.html',
  styleUrls: ['./resizer-col.component.less'],
  host: {
    class: 'nd-resizer nd-resizer-col',
  },
})
export class ResizerColComponent implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {}

  show(left: number): void {
    this.el.nativeElement.style.left = `${left}px`;
    this.el.nativeElement.style.display = 'block';
  }

  hide(): void {
    this.el.nativeElement.style.display = 'none';
  }
}
