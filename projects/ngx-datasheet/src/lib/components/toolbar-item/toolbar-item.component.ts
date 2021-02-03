import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nd-toolbar-item',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./toolbar-item.component.less'],
  host: {
    class: 'nd-toolbar-item',
  },
})
export class ToolbarItemComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
