import { Data } from '../types';
import {
  BehaviorSubject,
  concatAll,
  concatMap,
  mergeAll,
  mergeMap,
  Observable,
  startWith,
  Subject,
  switchAll,
  switchMap,
} from 'rxjs';
import { ConfigService } from './config.service';
import { SheetService } from './sheet.service';
import type { SheetServiceFactory } from './sheet.service';
import { ScrollingService } from './scrolling.service';
import { RenderProxyService } from './render-proxy.service';
import { inject, Lifecycle, scoped } from 'tsyringe';
import { Selector } from './selector.factory';
import { map } from 'rxjs/operators';

@scoped(Lifecycle.ContainerScoped)
export class DataService {
  dataChanged$: Observable<Data>;

  sheets: SheetService[] = [];
  selectedSheet$!: BehaviorSubject<[SheetService, number]>;
  selectorChanged$!: Observable<Selector[]>;

  get selectedSheet() {
    return this.selectedSheet$.value[0];
  }

  get selectedIndex() {
    return this.selectedSheet$.value[1];
  }

  get snapshot(): Data {
    return {
      sheets: this.sheets.map(({ data, selected, name, merges }) => ({
        data: { ...data, merges: merges.snapshot },
        name,
        selected,
      })),
    };
  }
  private dataChanged = new Subject<Data>();

  constructor(
    private configService: ConfigService,
    private scrolling: ScrollingService,
    private renderProxyService: RenderProxyService,
    @inject(SheetService) private sheetServiceFactory: SheetServiceFactory,
  ) {
    this.dataChanged$ = this.dataChanged.asObservable();
  }

  notifyDataChange(): void {
    this.dataChanged.next(this.snapshot);
  }

  rerender(): void {
    this.renderProxyService.render('all');
  }

  loadData(val: Data): void {
    this.sheets = val.sheets.map((s) => this.sheetServiceFactory(s));
    const selectedSheet = this.sheets.find((s) => s.selected)!;
    const selectedIndex = this.sheets.findIndex((s) => s.selected)!;
    this.selectedSheet$ = new BehaviorSubject([selectedSheet, selectedIndex]);
    this.selectorChanged$ = this.selectedSheet$.pipe(
      switchMap(([s]) => s.selectorChanged.pipe(startWith([]))),
    );
  }

  selectSheet(index: number): void {
    if (this.sheets[index].selected) {
      return;
    }
    for (let i = 0; i < this.sheets.length; i++) {
      if (i === index) {
        this.sheets[i].selected = true;
        this.selectedSheet$.next([this.sheets[i], i]);
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
    this.selectedSheet$.next([newSheet, this.sheets.length - 1]);
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
