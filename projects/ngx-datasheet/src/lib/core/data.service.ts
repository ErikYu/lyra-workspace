import { Inject, Injectable } from '@angular/core';
import { NDData } from '../ngx-datasheet.model';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from './config.service';
import { SheetService, SheetServiceFactory } from './sheet.service';
import { ScrollingService } from './scrolling.service';
import { RenderProxyService } from '../service/render-proxy.service';

@Injectable()
export class DataService {
  dataChanged$: Observable<NDData>;

  sheets: SheetService[] = [];
  selectedSheet!: SheetService;
  selectedIndex!: number;

  get snapshot(): NDData {
    return {
      sheets: this.sheets.map(({ data, selected, name, merges }) => ({
        data: { ...data, merges: merges.snapshot },
        name,
        selected,
      })),
    };
  }
  private dataChanged = new Subject<NDData>();

  constructor(
    private configService: ConfigService,
    private scrolling: ScrollingService,
    private renderProxyService: RenderProxyService,
    @Inject(SheetService) private sheetServiceFactory: SheetServiceFactory,
  ) {
    this.dataChanged$ = this.dataChanged.asObservable();
  }

  notifyDataChange(): void {
    this.dataChanged.next(this.snapshot);
  }

  rerender(): void {
    this.renderProxyService.render('all');
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
    this.notifyDataChange();
  }

  updateSheetName(index: number, name: string, onSuccess: () => void): void {
    // validator
    const hasDuplicate = !!this.sheets.find(
      (sheet, i) => i !== index && sheet.name === name,
    );
    if (hasDuplicate) {
      console.error('The new name is duplicate with exist sheet');
      return;
    }

    // setter
    this.sheets[index].name = name;

    onSuccess();
    this.notifyDataChange();
  }
}
