import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'nd-strike-action',
  templateUrl: './strike-action.component.html',
  styleUrls: ['./strike-action.component.less'],
})
export class StrikeActionComponent implements OnInit {
  constructor(private el: ElementRef) {}

  @HostListener('click')
  onClick(): void {
    document.execCommand('strikethrough', false);
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
