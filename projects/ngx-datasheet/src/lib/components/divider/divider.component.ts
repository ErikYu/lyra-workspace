import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'nd-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.less'],
})
export class DividerComponent implements OnInit {
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @HostBinding('class.nd-divider') enabled = true;
  @HostBinding('class.vertical') enabledVertical!: boolean;
  @HostBinding('class.horizontal') enabledHorizontal!: boolean;
  constructor() {}

  ngOnInit(): void {
    this.enabledVertical = this.direction === 'vertical';
    this.enabledHorizontal = this.direction === 'horizontal';
  }
}
