import { Component, OnInit } from '@angular/core';
import { TextValignDir, ValignController } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-valign-dropdown',
  templateUrl: './valign-dropdown.component.html',
  styleUrls: ['./valign-dropdown.component.scss'],
})
export class ValignDropdownComponent implements OnInit {
  controller: ValignController;
  isOpen = false;
  constructor(private c: BaseContainer) {
    this.controller = c.valignController;
  }

  ngOnInit() {
    this.controller.onInit();
  }

  applyTextValign(dir: TextValignDir): void {
    this.isOpen = false;
    this.controller.applyTextValign(dir);
  }
}
