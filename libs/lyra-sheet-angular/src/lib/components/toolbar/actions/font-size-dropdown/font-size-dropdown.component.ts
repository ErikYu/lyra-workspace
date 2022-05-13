import { Component, ElementRef, OnInit } from '@angular/core';
import { FontSizeController, FontSizeMenu } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-font-size-dropdown',
  templateUrl: './font-size-dropdown.component.html',
  styleUrls: ['./font-size-dropdown.component.scss'],
})
export class FontSizeDropdownComponent implements OnInit {
  controller: FontSizeController;
  open = false;
  curFontSize!: number;
  menus!: FontSizeMenu[];

  constructor(private el: ElementRef, private c: BaseContainer) {
    this.controller = c.fontSizeController;
  }

  applyFontSize(option: { pt: number; px: number }): void {
    this.controller.applyFontSize(option);
    this.open = false;
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: MouseEvent) =>
      evt.preventDefault();
    this.controller.curFontSize$.subscribe((res) => (this.curFontSize = res));
    this.controller.menus$.subscribe((res) => (this.menus = res));
    this.controller.onInit();
  }
}
