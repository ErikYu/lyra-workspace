import { Component, ElementRef, OnInit } from '@angular/core';
import { DEFAULT_FONT_COLOR, FontColorController } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-font-color-dropdown',
  templateUrl: './font-color-dropdown.component.html',
  styleUrls: ['./font-color-dropdown.component.scss'],
})
export class FontColorDropdownComponent implements OnInit {
  controller: FontColorController;
  isOpen = false;
  curFontColor = DEFAULT_FONT_COLOR;

  constructor(private el: ElementRef, private c: BaseContainer) {
    this.controller = c.fontColorController;
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  ngOnInit() {
    this.controller.curColor$.subscribe((res) => (this.curFontColor = res));
    this.controller.onInit();
  }

  applyTextColor(color: string): void {
    this.controller.applyTextColor(color);
    this.isOpen = false;
  }
}
