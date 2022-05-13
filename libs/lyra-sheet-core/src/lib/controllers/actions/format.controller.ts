import { Lifecycle, scoped } from 'tsyringe';
import { CellFormat } from '../../types';
import { DataService, HistoryService } from '../../services';
import { combineLatest, startWith, Subject } from 'rxjs';

type MenuOrDivider =
  | {
      fmt: CellFormat;
      label: string;
      desc: string;
      checked: () => boolean;
    }
  | 'DIVIDER';

@scoped(Lifecycle.ContainerScoped)
export class FormatController {
  curFmt$ = new Subject<CellFormat>();
  items$ = new Subject<MenuOrDivider[]>();
  controlDisplayLabel$ = new Subject<string>();

  private shouldReCalcDropdown = new Subject();

  constructor(
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  onInit() {
    combineLatest([
      this.dataService.selectorChanged$,
      this.shouldReCalcDropdown.pipe(startWith({})),
    ]).subscribe(([selectors]) => {
      if (selectors.length === 0) {
        this.curFmt$.next(undefined);
        this.items$.next(this.buildItems(undefined));
        this.controlDisplayLabel$.next('Auto');
      } else {
        const [ci, ri] = this.dataService.selectedSheet.selectors[0].startCord;
        const cell = this.dataService.selectedSheet.getCell(ri, ci);
        const fmt = cell?.style?.format;
        this.curFmt$.next(fmt);
        const items = this.buildItems(fmt);
        this.items$.next(items);
        const hit = items.find((it) => it !== 'DIVIDER' && it.fmt === fmt);
        this.controlDisplayLabel$.next((hit as any).label);
      }
    });
  }

  applyFormat(fmt: CellFormat): void {
    this.historyService.stacked(() => {
      for (const selector of this.dataService.selectedSheet.selectors) {
        this.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.dataService.selectedSheet.applyCellFormatTo(selector.range, fmt);
      }
    });
    this.shouldReCalcDropdown.next({});
    this.dataService.rerender();
  }

  buildItems(format: CellFormat): MenuOrDivider[] {
    return [
      {
        fmt: undefined,
        label: 'Auto',
        desc: '',
        checked: () => format === undefined,
      },
      {
        fmt: 'text',
        label: 'Plain text',
        desc: '',
        checked: () => format === 'text',
      },
      'DIVIDER',
      {
        fmt: 'number',
        label: 'Number',
        desc: '1,000.12',
        checked: () => format === 'number',
      },
      {
        fmt: 'percent',
        label: 'Percent',
        desc: '10.12%',
        checked: () => format === 'percent',
      },
      {
        fmt: 'scientific',
        label: 'Scientific',
        desc: '1.01E+03',
        checked: () => format === 'scientific',
      },
      'DIVIDER',
      {
        fmt: 'accounting',
        label: 'Accounting',
        desc: '$ (1,000.12)',
        checked: () => format === 'accounting',
      },
      {
        fmt: 'financial',
        label: 'Financial',
        desc: '(1,000.12)',
        checked: () => format === 'financial',
      },
      {
        fmt: 'currency',
        label: 'Currency',
        desc: '$1,000.12',
        checked: () => format === 'currency',
      },
      {
        fmt: 'currency_rounded',
        label: 'Currency(rounded)',
        desc: '$1,000',
        checked: () => format === 'currency_rounded',
      },
      'DIVIDER',
      {
        fmt: 'date',
        label: 'Date',
        desc: '7/1/2021',
        checked: () => format === 'date',
      },
      {
        fmt: 'time',
        label: 'Time',
        desc: '3:59:00 PM',
        checked: () => format === 'time',
      },
      {
        fmt: 'datetime',
        label: 'Datetime',
        desc: '7/1/2021 15:59:00',
        checked: () => format === 'datetime',
      },
    ];
  }
}
