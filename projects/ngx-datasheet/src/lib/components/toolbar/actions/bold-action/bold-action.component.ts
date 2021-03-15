import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { TextInputService } from '../../../../service/text-input.service';

@Component({
  selector: 'nd-bold-action',
  templateUrl: './bold-action.component.html',
  styleUrls: ['./bold-action.component.less'],
})
export class BoldActionComponent implements OnInit {
  constructor(
    public textInputService: TextInputService,
    private el: ElementRef,
  ) {}

  @HostListener('click')
  onClick(): void {
    document.execCommand('bold', false);
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
