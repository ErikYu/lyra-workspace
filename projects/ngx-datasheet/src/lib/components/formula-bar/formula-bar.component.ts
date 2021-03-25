import { Component, HostBinding, OnInit } from '@angular/core';
import { SelectorsService } from '../../core/selectors.service';
import { labelFromCell } from '../../utils';
import { DataService } from '../../core/data.service';
import { NDCellData } from '../../ngx-datasheet.model';

@Component({
  selector: 'nd-formula-bar',
  templateUrl: './formula-bar.component.html',
  styleUrls: ['./formula-bar.component.less'],
})
export class FormulaBarComponent implements OnInit {
  label!: string;

  hitCellText = '';

  @HostBinding('class.nd-formula-bar') h = true;
  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.selectorsService.selectorChanged.subscribe((res) => {
      if (Array.isArray(res) && res.length > 0) {
        const last = res[res.length - 1];
        const [hitRi, hitCi] = last.startCord;
        this.hitCellText =
          this.dataService.selectedSheet.getCellPlainText(hitRi, hitCi) || '';
        const { sri, sci, eri, eci } = last.range;
        if (last.range.isSingleCell) {
          this.label = labelFromCell(sri, sci);
        } else {
          this.label = `${labelFromCell(sri, sci)}:${labelFromCell(eri, eci)}`;
        }
      }
    });
  }
}
