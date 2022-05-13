import { Component, ElementRef, OnInit } from '@angular/core';
import { FontFamilyController } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

interface FFMenu {
  label: string;
  checked: boolean;
}

@Component({
  selector: 'lyra-sheet-font-family-dropdown',
  templateUrl: './font-family-dropdown.component.html',
  styleUrls: ['./font-family-dropdown.component.scss'],
})
export class FontFamilyDropdownComponent implements OnInit {
  controller: FontFamilyController;

  open = false;
  fontFamily = '';
  allFontFamilies: FFMenu[] = [];

  constructor(private el: ElementRef, private c: BaseContainer) {
    this.controller = this.c.fontFamilyController;
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  ngOnInit() {
    this.controller.fontFamily$.subscribe((res) => (this.fontFamily = res));
    this.controller.allFontFamilies$.subscribe(
      (res) => (this.allFontFamilies = res),
    );
    this.controller.onInit();
  }

  applyFontFamily(ff: string): void {
    this.controller.applyFontFamily(ff);
    this.open = false;
  }
}
