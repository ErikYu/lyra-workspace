import { Component, HostListener } from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';
import { BgColorController } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-bg-color-dropdown',
  templateUrl: './bg-color-dropdown.component.html',
  styleUrls: ['./bg-color-dropdown.component.scss'],
})
export class BgColorDropdownComponent {
  controller: BgColorController;
  isOpen = false;
  constructor(private c: BaseContainer) {
    this.controller = c.bgColorController;
  }

  @HostListener('click')
  showColorPalette(): void {
    this.isOpen = true;
  }

  onSelectColor(color: string): void {
    this.controller.applyBgColor(color);
    this.isOpen = false;
  }
}
