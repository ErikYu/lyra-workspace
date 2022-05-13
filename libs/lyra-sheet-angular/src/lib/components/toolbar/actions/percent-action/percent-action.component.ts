import { Component, HostListener } from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-percent-action',
  templateUrl: './percent-action.component.html',
  styleUrls: ['./percent-action.component.scss'],
})
export class PercentActionComponent {
  constructor(private c: BaseContainer) {}

  @HostListener('click')
  onClick(): void {
    this.c.historyService.stacked(() => {
      for (const selector of this.c.dataService.selectedSheet.selectors) {
        this.c.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.c.dataService.selectedSheet.applyCellFormatTo(
          selector.range,
          'percent',
        );
      }
    });
    this.c.dataService.rerender();
  }
}
