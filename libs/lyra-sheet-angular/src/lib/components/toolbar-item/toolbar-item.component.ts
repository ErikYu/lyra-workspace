import { Component } from '@angular/core';

@Component({
  selector: 'lyra-sheet-toolbar-item',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./toolbar-item.component.scss'],
  host: {
    class: 'lyra-sheet-toolbar-item',
  },
})
export class ToolbarItemComponent {}
