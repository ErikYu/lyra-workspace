import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';
import { FontStrikeController } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-strike-action',
  templateUrl: './strike-action.component.html',
  styleUrls: ['./strike-action.component.scss'],
})
export class StrikeActionComponent implements OnInit {
  controller: FontStrikeController;
  @HostBinding('class.activated') isStrike = false;

  constructor(private el: ElementRef, private c: BaseContainer) {
    this.controller = c.fontStrikeController;
  }

  @HostListener('click')
  onClick(): void {
    this.controller.toggle();
  }

  ngOnInit(): void {
    this.controller.value$.subscribe((res) => (this.isStrike = res));
    this.controller.onInit();
    this.el.nativeElement.onmousedown = (evt: MouseEvent) =>
      evt.preventDefault();
  }
}
