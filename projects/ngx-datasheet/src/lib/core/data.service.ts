import { Inject, Injectable } from '@angular/core';
import { NDData } from '../ngx-datasheet.model';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';
import { SheetService, SheetServiceFactory } from './sheet.service';
import { ScrollingService } from './scrolling.service';

@Injectable()
export class DataService {
  private data!: NDData;
  shouldRerender$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  sheets: SheetService[] = [];
  selectedSheet!: SheetService;

  constructor(
    private configService: ConfigService,
    private scrolling: ScrollingService,
    @Inject(SheetService) private sheetServiceFactory: SheetServiceFactory,
  ) {}

  rerender(): void {
    this.shouldRerender$.next(true);
  }

  initData(val: NDData): void {
    this.data = val;
    this.sheets = this.data.sheets.map((s) => this.sheetServiceFactory(s));
    this.selectedSheet = this.sheets[0];
    this.sheets[0].selected = true;
  }

  selectSheet(index: number): void {
    if (this.sheets[index].selected) {
      return;
    }
    for (let i = 0; i < this.sheets.length; i++) {
      if (i === index) {
        this.sheets[i].selected = true;
        this.selectedSheet = this.sheets[i];
      } else {
        this.sheets[i].selected = false;
      }
    }
    this.scrolling.resetScrollAt();
  }

  addSheet(): void {
    this.sheets.forEach((s) => (s.selected = false));
    const newSheet = this.sheetServiceFactory({
      name: 'Unnamed Sheet',
      data: {
        merges: [],
        rows: {},
        cols: {},
        rowCount: 100,
        colCount: 26,
      },
    });
    newSheet.selected = true;
    this.sheets.push(newSheet);
    this.selectedSheet = newSheet;
  }
}
