import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'nd-italic-action',
  templateUrl: './italic-action.component.html',
  styleUrls: ['./italic-action.component.less'],
})
export class ItalicActionComponent implements OnInit {
  constructor(private el: ElementRef) {}

  @HostListener('click')
  onClick(): void {
    document.execCommand('italic', false);
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
