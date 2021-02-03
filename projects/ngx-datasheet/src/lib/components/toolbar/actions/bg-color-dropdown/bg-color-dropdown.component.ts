import { Component, HostListener, OnInit } from '@angular/core';
import { SelectorsService } from '../../../../core/selectors.service';
import { DataService } from '../../../../core/data.service';

@Component({
  selector: 'nd-bg-color-dropdown',
  templateUrl: './bg-color-dropdown.component.html',
  styleUrls: ['./bg-color-dropdown.component.less'],
})
export class BgColorDropdownComponent implements OnInit {
  isOpen = false;
  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {}

  @HostListener('click')
  showColorPalette(): void {
    this.isOpen = true;
  }

  onSelectColor(color: string): void {
    this.isOpen = false;
    for (const st of this.selectorsService.selectors) {
      this.dataService.selectedSheet.applyBgColorTo(st.range, color);
    }
    this.dataService.rerender();
  }
}
