import { Component } from '@angular/core';
import { NDData } from '../../../ngx-datasheet/src/lib/ngx-datasheet.model';
import { DatasheetConfig } from '../../../ngx-datasheet/src/lib/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'ngx-datasheet-demo';

  config: DatasheetConfig = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
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
          merges: [
            [
              [4, 3],
              [5, 5],
            ],
          ],
          rows: {
            // 0: {
            //   height: 70,
            //   cells: {
            //     0: {
            //       plainText: 'asd',
            //       style: { textWrap: 'overflow', background: '#7030a0' },
            //       richText: [
            //         [
            //           { text: 'a', style: { color: '#ccc' } },
            //           { text: 'bcdefg', style: { fontSize: 30, strike: true } },
            //           {
            //             text: 'ahijklmn',
            //             style: { fontSize: 18, color: 'red' },
            //           },
            //         ],
            //         [{ text: '第二行', style: { fontSize: 14 } }],
            //       ],
            //     },
            //     2: {
            //       style: { valign: 'center' },
            //       plainText: 'asd',
            //       richText: [
            //         [
            //           { text: 'a', style: { color: '#ccc' } },
            //           { text: 'bcdefg', style: { fontSize: 30 } },
            //           {
            //             text: 'ahijklmn',
            //             style: { fontSize: 18, color: 'red' },
            //           },
            //         ],
            //         [{ text: '第二行', style: { fontSize: 14 } }],
            //       ],
            //     },
            //   },
            // },
            // 1: {
            //   cells: {
            //     0: {
            //       plainText: 'he chang henchang de xian hahah',
            //       style: {
            //         textWrap: 'clip',
            //       },
            //       richText: [[{ text: 'he chang henchang de xian hahah' }]],
            //     },
            //     1: {
            //       style: {
            //         background: 'yellow',
            //         border: {
            //           left: ['thin', 'red'],
            //           right: ['thin', 'blue'],
            //           top: ['medium', 'green'],
            //           bottom: ['bold', 'black'],
            //         },
            //       },
            //       plainText: '123123123123',
            //       richText: [
            //         [{ text: '123123123123', style: { fontSize: 20 } }],
            //       ],
            //     },
            //     2: {
            //       style: {
            //         border: {
            //           right: ['thin', 'blue'],
            //         },
            //       },
            //       plainText: '=======================',
            //       richText: [
            //         [
            //           {
            //             text: '=======================',
            //             style: { fontSize: 12 },
            //           },
            //         ],
            //       ],
            //     },
            //   },
            // },
            // 2: {
            //   height: 80,
            //   cells: {
            //     0: {
            //       plainText: '',
            //       richText: [[{ text: 'abc' }]],
            //     },
            //     1: {
            //       style: { valign: 'center', align: 'right' },
            //       plainText: '',
            //       richText: [[{ text: 'gdsjfc', style: { color: 'purple' } }]],
            //     },
            //     2: {
            //       style: { valign: 'top', align: 'center', textWrap: 'clip' },
            //       plainText: '',
            //       richText: [[{ text: 'abasdasdasdjah ass' }]],
            //     },
            //     3: {
            //       plainText: '',
            //       style: { valign: 'center', align: 'center' },
            //       richText: [[{ text: 'abc' }]],
            //     },
            //   },
            // },
            // 3: {
            //   height: 55,
            //   cells: {
            //     0: {
            //       plainText: '',
            //       style: { textWrap: 'wrap' },
            //       richText: [[{ text: 'i am a hero whose name is Superman' }]],
            //     },
            //     1: {
            //       plainText: '',
            //       style: { textWrap: 'wrap' },
            //       richText: [
            //         [
            //           { text: 'i am a hero wh' },
            //           { text: 'ose name is Superman', style: { color: 'red', strike: true } },
            //         ],
            //       ],
            //     },
            //     2: {
            //       plainText: '',
            //       style: { textWrap: 'wrap' },
            //       richText: [
            //         [
            //           { text: 'i am a hero wh', style: {strike: true, underline: true} },
            //           { text: 'ose name is Superman', style: { color: 'red' } },
            //         ],
            //       ],
            //     },
            //   },
            // },
            4: {
              cells: {
                3: {
                  plainText: '',
                  richText: [[{ text: 'merge: 1,2' }]],
                  style: {
                    merge: [1, 2],
                    border: {
                      left: ['thin', '#000'],
                      top: ['thin', '#000'],
                      right: ['thin', '#000'],
                      bottom: ['thin', '#000'],
                    }
                  },
                },
              },
            },
            // 5: {
            //   cells: {
            //     0: {
            //       style: {precision: 0},
            //       richText: [[{text: '1.2'}]],
            //       plainText: '',
            //     }
            //   }
            // },
            // 14: {
            //   cells: {
            //     0: {
            //       plainText: '',
            //       richText: [[{ text: 'A15' }]],
            //     },
            //     7: {
            //       plainText: '',
            //       richText: [[{ text: 'H15' }]],
            //     },
            //   },
            // },
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
      {
        name: 'Sheet2',
        data: {
          merges: [],
          rows: {},
          rowCount: 20,
          cols: {},
          colCount: 30,
        },
      },
    ],
  };
}
