import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'nd-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.less'],
})
export class DividerComponent implements OnInit {
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @HostBinding('class.nd-divider') enabled = true;
  @HostBinding('class.vertical') enabledVertical =
    this.direction === 'vertical';
  @HostBinding('class.horizontal') enabledHorizontal =
    this.direction === 'horizontal';
  constructor() {}

  ngOnInit(): void {}
}
