import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ContextmenuService } from '../../service/contextmenu.service';
import { colLabelFromIndex, setStyle } from '../../utils';
import { DataService } from '../../core/data.service';
import { HistoryService } from '../../service/history.service';
import { SelectorsService } from '../../core/selectors.service';
import { fromEvent } from 'rxjs';
import { CellRange } from '../../core/cell-range.factory';
import { ConfigService } from '../../core/config.service';
import { CONTEXTMENU_WIDTH } from '../../constants';

type MenuItem = {
  label: string;
  desc?: string;
} & (
  | { action: () => void; children?: never }
  | { action?: never; children: MenuItem[] }
);

@Component({
  selector: 'nd-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.less'],
})
export class ContextmenuComponent implements OnInit {
  @HostBinding('class.nd-contextmenu') h = true;
  menus: (MenuItem | 'DIVIDER')[] = [];

  activatedSubMenus: MenuItem[] = [];
  offsetTop = 0;
  offsetLeft = 0;

  private setUpMenus(
    rowCount: number,
    colCount: number,
    selectorRange: CellRange,
  ): void {
    const startRowNO = selectorRange.sri + 1;
    const endRowNO = selectorRange.eri + 1;
    const startColNO = colLabelFromIndex(selectorRange.sci);
    const endColNO = colLabelFromIndex(selectorRange.eci);
    this.menus = [
      {
        label: rowCount > 1 ? `Insert ${rowCount} rows` : 'Insert row',
        action: () => {
          this.historyService.stacked(() => {
            const { sri, eri } = this.selectorsService.last.range;
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
            const { sci, eci } = this.selectorsService.last.range;
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
                  this.selectorsService.last.range,
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
                  this.selectorsService.last.range,
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
            const { sri, eri } = this.selectorsService.last.range;
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
            const { sci, eci } = this.selectorsService.last.range;
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
                  this.selectorsService.last.range,
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
                  this.selectorsService.last.range,
                  'top',
                );
              });
              this.dataService.rerender();
            },
          },
        ],
      },
    ];
  }

  constructor(
    private contextmenuService: ContextmenuService,
    private dataService: DataService,
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
    private configService: ConfigService,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    // const backdrop = document.createElement('div');

    const hideContextMenu = () => {
      setStyle(this.el.nativeElement, { display: 'none' });
      this.activatedSubMenus = [];
      document.removeEventListener('click', hideContextMenu);
    };

    this.contextmenuService.options$.subscribe((option) => {
      if (option === null) {
        hideContextMenu();
      } else {
        document.addEventListener('click', hideContextMenu);
        const { left, top } = option;
        const { sri, eri, sci, eci } = this.selectorsService.last.range;
        this.setUpMenus(
          eri - sri + 1,
          eci - sci + 1,
          this.selectorsService.last.range,
        );
        this.activatedSubMenus = [];
        setStyle(this.el.nativeElement, {
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
      this.activatedSubMenus = submenus;
      this.offsetTop = (evt.target as HTMLElement).offsetTop;
      if (xLeft < CONTEXTMENU_WIDTH) {
        this.offsetLeft = -CONTEXTMENU_WIDTH * 2;
      } else {
        this.offsetLeft = 0;
      }
    } else {
      this.activatedSubMenus = [];
    }
  }
}
