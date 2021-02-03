import { Component, OnInit } from '@angular/core';
import { SelectorsService } from '../../../../core/selectors.service';
import { DataService } from '../../../../core/data.service';
import { TextValignDir } from '../../../../models';

@Component({
  selector: 'nd-valign-dropdown',
  templateUrl: './valign-dropdown.component.html',
  styleUrls: ['./valign-dropdown.component.less'],
})
export class ValignDropdownComponent implements OnInit {
  isOpen = false;
  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {}

  get currentDir(): TextValignDir {
    if (this.selectorsService.selectors.length === 0) {
      return 'bottom';
    }
    const [ri, ci] = this.selectorsService.selectors[0].startCord;
    const cell = this.dataService.selectedSheet.getCell(ri, ci);
    return cell?.style?.valign || 'bottom';
  }

  applyTextValign(dir: TextValignDir): void {
    this.isOpen = false;
    for (const st of this.selectorsService.selectors) {
      this.dataService.selectedSheet.applyTextValignTo(st.range, dir);
    }
    this.dataService.rerender();
  }
}