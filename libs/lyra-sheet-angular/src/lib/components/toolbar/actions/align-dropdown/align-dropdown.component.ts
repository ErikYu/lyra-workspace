import { Component, OnInit } from '@angular/core';
import { AlignController, TextAlignDir } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-align-dropdown',
  templateUrl: './align-dropdown.component.html',
  styleUrls: ['./align-dropdown.component.scss'],
})
export class AlignDropdownComponent implements OnInit {
  controller: AlignController;
  isOpen = false;
  constructor(private c: BaseContainer) {
    this.controller = c.alignController;
  }

  ngOnInit() {
    this.controller.onInit();
  }

  applyTextAlign(dir: TextAlignDir): void {
    this.isOpen = false;
    this.controller.applyTextAlign(dir);
  }
}
