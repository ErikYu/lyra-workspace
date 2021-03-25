import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { DataService } from '../../../../core/data.service';
import { HistoryService } from '../../../../service/history.service';
import { SelectorsService } from '../../../../core/selectors.service';

@Component({
  selector: 'nd-percent-action',
  templateUrl: './percent-action.component.html',
  styleUrls: ['./percent-action.component.less'],
})
export class PercentActionComponent implements OnInit {
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
          'percent',
        );
      }
    });
    this.dataService.rerender();
  }

  ngOnInit(): void {}
}
