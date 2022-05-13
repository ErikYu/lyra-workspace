import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';
import { FontBoldController } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-bold-action',
  templateUrl: './bold-action.component.html',
  styleUrls: ['./bold-action.component.scss'],
})
export class BoldActionComponent implements OnInit {
  controller: FontBoldController;
  @HostBinding('class.activated') isBold = false;

  constructor(private c: BaseContainer, private el: ElementRef) {
    this.controller = c.fontBoldController;
  }

  @HostListener('click')
  onClick(): void {
    this.controller.toggle();
  }

  ngOnInit(): void {
    this.controller.value$.subscribe((res) => (this.isBold = res));
    this.controller.onInit();
    this.el.nativeElement.onmousedown = (evt: MouseEvent) =>
      evt.preventDefault();
  }
}
