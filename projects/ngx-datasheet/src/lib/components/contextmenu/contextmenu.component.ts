import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ContextmenuService } from '../../service/contextmenu.service';
import { setStyle } from '../../utils';
import { DataService } from '../../core/data.service';
import { HistoryService } from '../../service/history.service';
import { SelectorsService } from '../../core/selectors.service';
import { fromEvent } from 'rxjs';

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
  menus: MenuItem[] = [];

  activatedSubMenus: MenuItem[] = [];
  offsetTop = 0;

  private setUpMenus(rowCount: number, colCount: number): void {
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
    ];
  }

  constructor(
    private contextmenuService: ContextmenuService,
    private dataService: DataService,
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    // const backdrop = document.createElement('div');

    const hideContextMenu = () => {
      setStyle(this.el.nativeElement, { display: 'none' });
      this.activatedSubMenus = [];
      document.removeEventListener('click', hideContextMenu);
      // try {
      //   document.body.removeChild(backdrop);
      // } catch (e) {}
    };

    // fromEvent(backdrop, 'click').subscribe(hideContextMenu);
    // this.renderer.addClass(backdrop, 'nd-frozen-backdrop');
    this.contextmenuService.options$.subscribe((option) => {
      if (option === null) {
        hideContextMenu();
      } else {
        // document.body.appendChild(backdrop);
        document.addEventListener('click', hideContextMenu);
        const { left, top } = option;
        const { sri, eri, sci, eci } = this.selectorsService.last.range;
        this.setUpMenus(eri - sri + 1, eci - sci + 1);
        setStyle(this.el.nativeElement, {
          display: 'block',
          left: `${left}px`,
          top: `${top}px`,
          zIndex: '1',
        });
      }
    });
  }

  showSubMenus(evt: MouseEvent, submenus?: MenuItem[]): void {
    if (Array.isArray(submenus) && submenus.length > 0) {
      this.activatedSubMenus = submenus;
      this.offsetTop = (evt.target as HTMLElement).offsetTop;
    } else {
      this.activatedSubMenus = [];
    }
  }
}
