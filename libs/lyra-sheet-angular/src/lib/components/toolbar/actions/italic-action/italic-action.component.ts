import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';
import { FontItalicController } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-italic-action',
  templateUrl: './italic-action.component.html',
  styleUrls: ['./italic-action.component.scss'],
})
export class ItalicActionComponent implements OnInit {
  controller: FontItalicController;
  @HostBinding('class.activated') isItalicNow = false;

  constructor(private el: ElementRef, private c: BaseContainer) {
    this.controller = c.fontItalicController;
  }

  @HostListener('click')
  onClick(): void {
    this.controller.toggle();
  }

  ngOnInit(): void {
    this.controller.value$.subscribe((res) => (this.isItalicNow = res));
    this.controller.onInit();
    this.el.nativeElement.onmousedown = (evt: MouseEvent) =>
      evt.preventDefault();
  }
}
