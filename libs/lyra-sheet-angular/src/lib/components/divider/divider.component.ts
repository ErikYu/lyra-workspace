import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lyra-sheet-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
})
export class DividerComponent implements OnInit {
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';
  @HostBinding('class.lyra-sheet-divider') enabled = true;
  @HostBinding('class.vertical') enabledVertical!: boolean;
  @HostBinding('class.horizontal') enabledHorizontal!: boolean;

  ngOnInit(): void {
    this.enabledVertical = this.direction === 'vertical';
    this.enabledHorizontal = this.direction === 'horizontal';
  }
}
