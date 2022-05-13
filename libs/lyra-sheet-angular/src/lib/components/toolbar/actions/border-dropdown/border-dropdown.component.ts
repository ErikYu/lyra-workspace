import { Component } from '@angular/core';
import { BorderController, BorderType, Selector } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';
import { BorderSelection } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-border-dropdown',
  templateUrl: './border-dropdown.component.html',
  styleUrls: ['./border-dropdown.component.scss'],
})
export class BorderDropdownComponent {
  controller: BorderController;
  open = false;
  borderTypeOpen = false;
  borderColorOpen = false;
  constructor(private c: BaseContainer) {
    this.controller = c.borderController;
  }

  applyBorder(type: BorderSelection): void {
    this.controller.applyBorder(type);
    this.open = false;
  }

  onSelectType(borderType: BorderType): void {
    this.controller.onSelectType(borderType);
    this.borderTypeOpen = false;
  }

  onSelectColor(color: string): void {
    this.controller.onSelectColor(color);
    this.borderColorOpen = false;
  }
}
