import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'nd-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less'],
})
export class ToolbarComponent implements OnInit {
  @HostBinding('class.nd-toolbar') h = true;
  constructor() {}

  ngOnInit(): void {}
}
