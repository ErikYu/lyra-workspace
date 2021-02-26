import { Component, OnInit } from '@angular/core';
import { BorderType } from '../../../../models';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { BorderSelection } from '../../../../core/sheet.service';

@Component({
  selector: 'nd-border-dropdown',
  templateUrl: './border-dropdown.component.html',
  styleUrls: ['./border-dropdown.component.less'],
})
export class BorderDropdownComponent implements OnInit {
  defaultBorderType: BorderType = 'thin';
  defaultBorderColor = '#000000';
  open = false;
  borderTypeOpen = false;
  borderColorOpen = false;
  constructor(
    private dataService: DataService,
    private selectorsService: SelectorsService,
  ) {}

  ngOnInit(): void {}

  applyBorder(type: BorderSelection): void {
    this.selectorsService.selectors.forEach((st) => {
      this.dataService.selectedSheet.applyBorderTo(
        st.range,
        type,
        this.defaultBorderType,
        this.defaultBorderColor,
      );
    });
    this.open = false;
    this.dataService.rerender();
  }

  onSelectType(borderType: BorderType): void {
    this.defaultBorderType = borderType;
    this.borderTypeOpen = false;
  }

  onSelectColor(color: string): void {
    this.defaultBorderColor = color;
    this.borderColorOpen = false;
  }
}
