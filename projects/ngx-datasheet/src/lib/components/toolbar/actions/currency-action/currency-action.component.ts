import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { DataService } from '../../../../core/data.service';
import { HistoryService } from '../../../../service/history.service';
import { SelectorsService } from '../../../../core/selectors.service';

@Component({
  selector: 'nd-currency-action',
  templateUrl: './currency-action.component.html',
  styleUrls: ['./currency-action.component.less'],
})
export class CurrencyActionComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private historyService: HistoryService,
    private selectorsService: SelectorsService,
  ) {}

  @HostListener('click')
  onClick(): void {
    this.historyService.stacked(() => {
      for (const selector of this.selectorsService.selectors) {
        this.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.dataService.selectedSheet.applyCellFormatTo(
          selector.range,
          'currency',
        );
      }
    });
    this.dataService.rerender();
  }
  ngOnInit(): void {}
}
