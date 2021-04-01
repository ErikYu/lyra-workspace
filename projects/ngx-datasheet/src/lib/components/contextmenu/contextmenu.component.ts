import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { ContextmenuService } from '../../service/contextmenu.service';
import { setStyle } from '../../utils';
import { DataService } from '../../core/data.service';
import { HistoryService } from '../../service/history.service';
import { SelectorsService } from '../../core/selectors.service';

@Component({
  selector: 'nd-contextmenu',
  templateUrl: './contextmenu.component.html',
  styleUrls: ['./contextmenu.component.less'],
})
export class ContextmenuComponent implements OnInit {
  @HostBinding('class.nd-contextmenu') h = true;
  menus: any[] = [];

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
          this.contextmenuService.hide();
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
          this.contextmenuService.hide();
        },
      },
      // {
      //   label: 'Insert cells',
      //   action: () => {},
      // },
    ];
  }

  constructor(
    private contextmenuService: ContextmenuService,
    private dataService: DataService,
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.contextmenuService.options$.subscribe((option) => {
      if (option === null) {
        // hide
        setStyle(this.el.nativeElement, {
          display: 'none',
        });
      } else {
        const { left, top } = option;
        const { sri, eri, sci, eci } = this.selectorsService.last.range;
        this.setUpMenus(eri - sri + 1, eci - sci + 1);
        setStyle(this.el.nativeElement, {
          display: 'block',
          left: `${left}px`,
          top: `${top}px`,
        });
      }
    });
  }
}
