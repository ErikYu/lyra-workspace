import { Component, OnInit } from '@angular/core';
import { TextWrapController, TextWrapType } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-text-wrap-dropdown',
  templateUrl: './text-wrap-dropdown.component.html',
  styleUrls: ['./text-wrap-dropdown.component.scss'],
})
export class TextWrapDropdownComponent implements OnInit {
  controller: TextWrapController;
  open = false;
  constructor(private c: BaseContainer) {
    this.controller = c.textWrapController;
  }

  ngOnInit() {
    this.controller.onInit();
  }

  selectTextWrap(type: TextWrapType): void {
    this.open = false;
    this.controller.applyTextWrap(type);
  }
}
