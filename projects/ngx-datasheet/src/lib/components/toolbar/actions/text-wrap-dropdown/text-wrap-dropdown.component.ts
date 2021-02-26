import { Component, OnInit } from '@angular/core';
import { TextWrapType } from '../../../../models';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';

@Component({
  selector: 'nd-text-wrap-dropdown',
  templateUrl: './text-wrap-dropdown.component.html',
  styleUrls: ['./text-wrap-dropdown.component.less'],
})
export class TextWrapDropdownComponent implements OnInit {
  open = false;
  constructor(
    private dataService: DataService,
    private selectorsService: SelectorsService,
  ) {}

  ngOnInit(): void {}

  get selectorTextWrapType(): TextWrapType {
    if (this.selectorsService.selectors.length === 0) {
      return 'overflow';
    }
    const [ri, ci] = this.selectorsService.selectors[0].startCord;
    const cell = this.dataService.selectedSheet.getCell(ri, ci);
    return cell?.style?.textWrap || 'overflow';
  }

  selectTextWrap(type: TextWrapType): void {
    this.selectorsService.selectors.forEach((st) => {
      this.dataService.selectedSheet.applyTextWrapTo(st.range, type);
    });
    this.dataService.rerender();
  }
}
