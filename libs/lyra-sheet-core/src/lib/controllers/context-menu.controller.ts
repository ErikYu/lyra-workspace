import { Lifecycle, scoped } from 'tsyringe';
import {
  CellRange,
  ConfigService,
  ContextmenuService,
  DataService,
  HistoryService,
} from '../services';
import { colLabelFromIndex, setStyle } from '../utils';
import { CONTEXTMENU_WIDTH } from '../constants';
import { Subject } from 'rxjs';

type MenuItem = {
  label: string;
  desc?: string;
} & (
  | { action: () => void; children?: never }
  | { action?: never; children: MenuItem[] }
);

export type ContextMenus = (MenuItem | 'DIVIDER')[];

@scoped(Lifecycle.ContainerScoped)
export class ContextMenuController {
  menus$: Subject<ContextMenus> = new Subject<ContextMenus>();
  activatedSubMenus$: Subject<ContextMenus> = new Subject<ContextMenus>();
  offsetTop$ = new Subject<number>();
  offsetLeft$ = new Subject<number>();
  el!: HTMLElement;
  constructor(
    private contextmenuService: ContextmenuService,
    private configService: ConfigService,
    private historyService: HistoryService,
    private dataService: DataService,
  ) {}

  mount(el: HTMLElement) {
    this.el = el;
  }

  onInit() {
    const hideContextMenu = () => {
      setStyle(this.el, { display: 'none' });
      this.activatedSubMenus$.next([]);
      document.removeEventListener('click', hideContextMenu);
    };

    this.contextmenuService.options$.subscribe((option) => {
      if (option === null) {
        hideContextMenu();
      } else {
        document.addEventListener('click', hideContextMenu);
        const { left, top } = option;
        const { sri, eri, sci, eci } =
          this.dataService.selectedSheet.last.range;
        this.setUpMenus(
          eri - sri + 1,
          eci - sci + 1,
          this.dataService.selectedSheet.last.range,
        );
        this.activatedSubMenus$.next([]);
        setStyle(this.el, {
          display: 'flex',
          left: `${left}px`,
          top: `${top}px`,
          zIndex: '1',
        });
      }
    });
  }

  showSubMenus(evt: MouseEvent, submenus?: MenuItem[]): void {
    if (Array.isArray(submenus) && submenus.length > 0) {
      const xLeft =
        this.configService.snapshot.sheetWidth -
        (evt.target as HTMLElement).getBoundingClientRect().right;
      this.activatedSubMenus$.next(submenus);
      this.offsetTop$.next((evt.target as HTMLElement).offsetTop);
      if (xLeft < CONTEXTMENU_WIDTH) {
        this.offsetLeft$.next(-CONTEXTMENU_WIDTH * 2);
      } else {
        this.offsetLeft$.next(0);
      }
    } else {
      this.activatedSubMenus$.next([]);
    }
  }

  private setUpMenus(
    rowCount: number,
    colCount: number,
    selectorRange: CellRange,
  ): void {
    const startRowNO = selectorRange.sri + 1;
    const endRowNO = selectorRange.eri + 1;
    const startColNO = colLabelFromIndex(selectorRange.sci);
    const endColNO = colLabelFromIndex(selectorRange.eci);
    this.menus$.next([
      {
        label: rowCount > 1 ? `Insert ${rowCount} rows` : 'Insert row',
        action: () => {
          this.historyService.stacked(() => {
            const { sri, eri } = this.dataService.selectedSheet.last.range;
            const count = eri - sri + 1;
            this.dataService.selectedSheet.insertRowsAbove(sri, count);
          });
          this.dataService.rerender();
          // this.contextmenuService.hide();
        },
      },
      {
        label: colCount > 1 ? `Insert ${colCount} columns` : 'Insert column',
        action: () => {
          this.historyService.stacked(() => {
            const { sci, eci } = this.dataService.selectedSheet.last.range;
            const count = eci - sci + 1;
            this.dataService.selectedSheet.insertColsLeft(sci, count);
          });
          this.dataService.rerender();
          // this.contextmenuService.hide();
        },
      },
      {
        label: 'Insert cells',
        children: [
          {
            label: 'Shift right',
            action: () => {
              this.historyService.stacked(() => {
                this.dataService.selectedSheet.insertCells(
                  this.dataService.selectedSheet.last.range,
                  'right',
                );
              });
              this.dataService.rerender();
              // this.contextmenuService.hide();
            },
          },
          {
            label: 'Shift down',
            action: () => {
              this.historyService.stacked(() => {
                this.dataService.selectedSheet.insertCells(
                  this.dataService.selectedSheet.last.range,
                  'down',
                );
              });
              this.dataService.rerender();
            },
          },
        ],
      },
      'DIVIDER',
      {
        label:
          rowCount > 1
            ? `Delete rows ${startRowNO} - ${endRowNO}`
            : 'Delete row',
        action: () => {
          this.historyService.stacked(() => {
            const { sri, eri } = this.dataService.selectedSheet.last.range;
            this.dataService.selectedSheet.deleteRows(sri, eri);
          });
          this.dataService.rerender();
        },
      },
      {
        label:
          colCount > 1
            ? `Delete columns ${startColNO} - ${endColNO}`
            : 'Delete columns',
        action: () => {
          this.historyService.stacked(() => {
            const { sci, eci } = this.dataService.selectedSheet.last.range;
            this.dataService.selectedSheet.deleteColumns(sci, eci);
          });
          this.dataService.rerender();
        },
      },
      {
        label: 'Delete cells',
        children: [
          {
            label: 'Shift left',
            action: () => {
              this.historyService.stacked(() => {
                this.dataService.selectedSheet.deleteCells(
                  this.dataService.selectedSheet.last.range,
                  'left',
                );
              });
              this.dataService.rerender();
            },
          },
          {
            label: 'Shift up',
            action: () => {
              this.historyService.stacked(() => {
                this.dataService.selectedSheet.deleteCells(
                  this.dataService.selectedSheet.last.range,
                  'top',
                );
              });
              this.dataService.rerender();
            },
          },
        ],
      },
    ]);
  }
}
