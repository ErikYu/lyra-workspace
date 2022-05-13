import { Component, OnInit } from '@angular/core';
import { CellFormat, FormatController } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-format-dropdown',
  templateUrl: './format-dropdown.component.html',
  styleUrls: ['./format-dropdown.component.scss'],
})
export class FormatDropdownComponent implements OnInit {
  controller: FormatController;
  controlDisplayLabel!: string;

  isOpen = false;

  items!: Array<
    | {
        fmt: CellFormat;
        label: string;
        desc: string;
        checked: () => boolean;
      }
    | 'DIVIDER'
  >;

  constructor(private c: BaseContainer) {
    this.controller = c.formatController;
  }

  ngOnInit() {
    this.controller.items$.subscribe((res) => (this.items = res));
    this.controller.controlDisplayLabel$.subscribe(
      (res) => (this.controlDisplayLabel = res),
    );
    this.controller.onInit();
  }

  applyFormat(fmt: CellFormat): void {
    this.controller.applyFormat(fmt);
    this.isOpen = false;
  }
}
