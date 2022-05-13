import { Component, HostListener, OnInit } from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';
import { MergeController } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-sheet-merge-dropdown',
  templateUrl: './merge-dropdown.component.html',
  styleUrls: ['./merge-dropdown.component.scss'],
  host: {
    class: 'lyra-sheet-dropdown merge',
  },
})
export class MergeDropdownComponent implements OnInit {
  controller: MergeController;
  constructor(private c: BaseContainer) {
    this.controller = c.mergeController;
  }

  @HostListener('click')
  onClick(): void {
    this.controller.applyMerge();
  }

  ngOnInit() {
    this.controller.onInit();
  }
}
