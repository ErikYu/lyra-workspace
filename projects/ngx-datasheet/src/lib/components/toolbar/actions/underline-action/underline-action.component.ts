import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'nd-underline-action',
  templateUrl: './underline-action.component.html',
  styleUrls: ['./underline-action.component.less'],
})
export class UnderlineActionComponent implements OnInit {
  constructor(private el: ElementRef) {}

  @HostListener('click')
  onClick(): void {
    document.execCommand('underline', false);
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
