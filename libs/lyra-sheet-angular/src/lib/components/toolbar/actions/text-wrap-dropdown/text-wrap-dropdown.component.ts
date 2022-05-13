import { Component } from '@angular/core';
import { TextWrapType } from '@lyra-sheet/core';
import { BaseContainer } from '../../../../services/_base_container';

@Component({
  selector: 'lyra-sheet-text-wrap-dropdown',
  templateUrl: './text-wrap-dropdown.component.html',
  styleUrls: ['./text-wrap-dropdown.component.scss'],
})
export class TextWrapDropdownComponent {
  open = false;
  constructor(private c: BaseContainer) {}

  get selectorTextWrapType(): TextWrapType {
    if (this.c.dataService.selectedSheet.selectors.length === 0) {
      return 'overflow';
    }
    const [ci, ri] = this.c.dataService.selectedSheet.selectors[0].startCord;
    const cell = this.c.dataService.selectedSheet.getCell(ri, ci);
    return cell?.style?.textWrap || 'overflow';
  }

  selectTextWrap(type: TextWrapType): void {
    this.c.historyService.stacked(() => {
      this.c.dataService.selectedSheet.selectors.forEach((st) => {
        this.c.dataService.selectedSheet.applyTextWrapTo(st.range, type);
      });
    });
    this.c.dataService.rerender();
  }
}
