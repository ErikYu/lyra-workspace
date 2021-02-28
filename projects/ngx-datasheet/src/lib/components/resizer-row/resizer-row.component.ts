import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nd-resizer-row',
  templateUrl: './resizer-row.component.html',
  styleUrls: ['./resizer-row.component.less'],
  host: {
    class: 'nd-resizer nd-resizer-row',
  },
})
export class ResizerRowComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
