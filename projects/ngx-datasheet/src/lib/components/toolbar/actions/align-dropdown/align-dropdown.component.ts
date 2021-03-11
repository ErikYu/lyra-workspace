import { Component, OnInit } from '@angular/core';
import { SelectorsService } from '../../../../core/selectors.service';
import { DataService } from '../../../../core/data.service';
import { TextAlignDir } from '../../../../models';
import { HistoryService } from '../../../../service/history.service';

@Component({
  selector: 'nd-align-dropdown',
  templateUrl: './align-dropdown.component.html',
  styleUrls: ['./align-dropdown.component.less'],
})
export class AlignDropdownComponent implements OnInit {
  isOpen = false;
  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
    private historyService: HistoryService,
  ) {}

  ngOnInit(): void {}

  get currentDir(): TextAlignDir {
    if (this.selectorsService.selectors.length === 0) {
      return 'left';
    }
    const [ri, ci] = this.selectorsService.selectors[0].startCord;
    const cell = this.dataService.selectedSheet.getCell(ri, ci);
    return cell?.style?.align || 'left';
  }

  applyTextAlign(dir: TextAlignDir): void {
    this.isOpen = false;
    this.historyService.stacked(() => {
      for (const st of this.selectorsService.selectors) {
        this.dataService.selectedSheet.applyTextAlignTo(st.range, dir);
      }
    });
    this.dataService.rerender();
  }
}
