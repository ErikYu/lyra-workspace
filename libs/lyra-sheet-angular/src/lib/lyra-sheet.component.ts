import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Data, DatasheetConfig } from '@lyra-sheet/core';
import { fromEvent } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { cloneDeep } from '@lyra-sheet/core';
import { BaseContainer } from './services/_base_container';

@Component({
  selector: 'lyra-sheet',
  templateUrl: './lyra-sheet.component.html',
  styleUrls: ['./lyra-sheet.component.scss'],
  providers: [BaseContainer],
  host: { class: 'lyra-sheet' },
})
export class LyraSheetComponent implements OnInit {
  @Input() config: DatasheetConfig = {
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

  @Input() data: Data = {
    sheets: [
      {
        name: 'Sheet1',
        data: {
          merges: [],
          rows: {},
          rowCount: 100,
          cols: {},
          colCount: 30,
        },
        selected: true,
      },
    ],
  };

  @Output() dataChange = new EventEmitter<Data>();
  constructor(
    private container: BaseContainer,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    document.execCommand('styleWithCSS', false, true as never);
    this.container.elementRefService.init(this.el.nativeElement);
    this.container.configService.setConfig(this.config);
    fromEvent(window, 'resize')
      .pipe(startWith({}))
      .subscribe(() => {
        this.el.nativeElement.style.width = `${this.config.width()}px`;
        this.el.nativeElement.style.height = `${this.config.height()}px`;
        this.container.configService.resize(this.el.nativeElement);
      });
    const initialData = cloneDeep(this.data);
    this.container.dataService.loadData(initialData);
    this.container.historyService.init(initialData);
    this.container.viewRangeService.init();
    this.container.dataService.dataChanged$.subscribe((res: Data) => {
      this.dataChange.emit(res);
    });
  }
}
