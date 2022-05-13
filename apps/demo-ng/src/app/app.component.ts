import { Component, OnInit } from '@angular/core';
import { Data, DatasheetConfig } from '@lyra-sheet/core';

@Component({
  selector: 'lyra-workspace-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  config: DatasheetConfig = {
    width: () => 900,
    height: () => 400,
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

  data: Data = {
    sheets: [
      {
        name: 'Sheet1',
        data: {
          merges: [],
          rows: {
            1: {
              cells: {
                1: {
                  richText: [[{ text: '123' }]],
                },
              },
            },
          },
          rowCount: 100,
          cols: {
            1: {
              width: 95,
            },
          },
          colCount: 30,
        },
        selected: true,
      },
    ],
  };

  data2: Data = {
    sheets: [
      {
        name: 'Sheet1',
        data: {
          merges: [],
          rows: {
            1: {
              cells: {
                1: {
                  richText: [[{ text: '123' }]],
                },
              },
            },
          },
          rowCount: 100,
          cols: {
            1: {
              width: 95,
            },
          },
          colCount: 30,
        },
        selected: true,
      },
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
