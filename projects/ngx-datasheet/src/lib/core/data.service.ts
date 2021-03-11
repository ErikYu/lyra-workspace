import { Inject, Injectable } from '@angular/core';
import { NDData } from '../ngx-datasheet.model';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';
import { SheetService, SheetServiceFactory } from './sheet.service';
import { ScrollingService } from './scrolling.service';

@Injectable()
export class DataService {
  shouldRerender$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  sheets: SheetService[] = [];
  selectedSheet!: SheetService;
  selectedIndex!: number;

  get snapshot(): NDData {
    return {
      sheets: this.sheets.map(({ data, selected, name }) => ({
        data,
        name,
        selected,
      })),
    };
  }

  constructor(
    private configService: ConfigService,
    private scrolling: ScrollingService,
    @Inject(SheetService) private sheetServiceFactory: SheetServiceFactory,
  ) {}

  rerender(): void {
    this.shouldRerender$.next(true);
  }

  loadData(val: NDData): void {
    this.sheets = val.sheets.map((s) => this.sheetServiceFactory(s));
    this.selectedSheet = this.sheets.find((s) => s.selected)!;
    this.selectedIndex = this.sheets.findIndex((s) => s.selected)!;
  }

  selectSheet(index: number): void {
    if (this.sheets[index].selected) {
      return;
    }
    for (let i = 0; i < this.sheets.length; i++) {
      if (i === index) {
        this.sheets[i].selected = true;
        this.selectedSheet = this.sheets[i];
        this.selectedIndex = i;
      } else {
        this.sheets[i].selected = false;
      }
    }
    this.scrolling.resetScrollAt();
  }

  addSheet(): void {
    this.sheets.forEach((s) => (s.selected = false));
    const newSheet = this.sheetServiceFactory({
      name: `Unnamed Sheet (${this.sheets.length})`,
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
    this.selectedIndex = this.sheets.length - 1;
  }
}
