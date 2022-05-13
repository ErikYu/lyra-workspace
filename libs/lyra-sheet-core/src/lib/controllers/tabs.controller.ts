import { Lifecycle, scoped } from 'tsyringe';
import { Subject } from 'rxjs';
import {
  DataService,
  HistoryService,
  SheetService,
  ViewRangeService,
} from '../services';

@scoped(Lifecycle.ContainerScoped)
export class TabsController {
  tabs$ = new Subject<SheetService[]>();
  editingIndex$ = new Subject<number | null>();
  constructor(
    private dataService: DataService,
    private viewRangeService: ViewRangeService,
    private historyService: HistoryService,
  ) {}

  selectSheet(index: number): void {
    this.dataService.selectSheet(index);
    this.tabs$.next(this.dataService.sheets);
    this.viewRangeService.init();
    this.dataService.rerender();
  }

  triggerBlur(evt: Event): void {
    evt.stopPropagation();
    const inputEl = evt.target as HTMLInputElement;
    inputEl.blur();
  }

  updateSheetName(evt: Event, index: number): void {
    console.log('updateSheetName===========');
    const inputEl = evt.target as HTMLInputElement;
    const newName = inputEl.value;
    this.dataService.updateSheetName(index, newName, () => {
      this.editingIndex$.next(null);
    });
  }

  addSheet(): void {
    this.historyService.stacked(() => {
      this.dataService.addSheet();
      this.tabs$.next(this.dataService.sheets);
    });
    this.viewRangeService.init();
    this.dataService.rerender();
  }

  editSheetName(index: number): void {
    this.editingIndex$.next(index);
  }
}
