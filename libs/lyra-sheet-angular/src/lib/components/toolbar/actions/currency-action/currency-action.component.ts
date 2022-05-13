import { Component, HostListener } from '@angular/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-currency-action',
  templateUrl: './currency-action.component.html',
  styleUrls: ['./currency-action.component.scss'],
})
export class CurrencyActionComponent {
  constructor(private c: BaseContainer) {}

  @HostListener('click')
  onClick(): void {
    this.c.historyService.stacked(() => {
      for (const selector of this.c.dataService.selectedSheet.selectors) {
        this.c.dataService.selectedSheet.resetPrecisionTo(selector.range);
        this.c.dataService.selectedSheet.applyCellFormatTo(
          selector.range,
          'currency',
        );
      }
    });
    this.c.dataService.rerender();
  }
}
