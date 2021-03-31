import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { SelectorsService } from '../../core/selectors.service';

@Component({
  selector: 'nd-selector-container',
  templateUrl: './selector-container.component.html',
  styleUrls: ['./selector-container.component.less'],
})
export class SelectorContainerComponent implements OnInit {
  @HostBinding('class.nd-selector-container') h = true;

  constructor(
    public selectorRangeService: SelectorsService,
    private el: ElementRef<HTMLElement>,
  ) {
    this.el.nativeElement.style.left = '60px';
    this.el.nativeElement.style.top = '25px';
  }

  ngOnInit(): void {}
}
