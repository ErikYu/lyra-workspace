import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';
import { FontUnderlineController } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-underline-action',
  templateUrl: './underline-action.component.html',
  styleUrls: ['./underline-action.component.scss'],
})
export class UnderlineActionComponent implements OnInit {
  controller: FontUnderlineController;
  @HostBinding('class.activated') isUnderlineNow = false;

  constructor(private el: ElementRef, private c: BaseContainer) {
    this.controller = c.fontUnderlineController;
  }

  @HostListener('click')
  onClick(): void {
    this.controller.toggle();
  }

  ngOnInit(): void {
    this.controller.value$.subscribe((res) => (this.isUnderlineNow = res));
    this.controller.onInit();
    this.el.nativeElement.onmousedown = (evt: MouseEvent) =>
      evt.preventDefault();
  }
}
