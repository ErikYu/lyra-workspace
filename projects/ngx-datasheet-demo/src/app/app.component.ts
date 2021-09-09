import {Component, OnInit} from '@angular/core';
import { NDData } from '../../../ngx-datasheet/src/lib/ngx-datasheet.model';
import { DatasheetConfig } from '../../../ngx-datasheet/src/lib/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  config: DatasheetConfig = {
    width: () => document.documentElement.clientWidth,
    height: () => document.documentElement.clientHeight,
    row: {
      height: 25,
      count: 100,
      indexHeight: 25,
    },
    col: {
      width: 100,
      count: 30,
      indexWidth: 60,
    },
  };

  data: NDData = {
    sheets: [
      {
        name: 'Sheet1',
        data: {
          merges: [],
          rows: {},
          rowCount: 100,
          cols: {
            1: {
              width: 95,
            },
          },
          colCount: 30,
        },
        selected: true,
      }
    ],
  };

  onChange(): void {
    localStorage.setItem('ngx-datasheet-demo:data', JSON.stringify(this.data));
  }

  ngOnInit(): void {
    const cache = localStorage.getItem('ngx-datasheet-demo:data');
    if (cache) {
      this.data = JSON.parse(cache);
    }
  }
}
