import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { SelectorsService } from '../../../../core/selectors.service';
import { DataService } from '../../../../core/data.service';
import { isNil, isNumber } from '../../../../utils';
import { HistoryService } from '../../../../service/history.service';

@Component({
  selector: 'nd-decimal-action',
  templateUrl: './decimal-action.component.html',
  styleUrls: ['./decimal-action.component.less'],
})
export class DecimalActionComponent implements OnInit {
  @Input() tpe!: 'add' | 'reduce';

  constructor(
    private el: ElementRef,
    private selectorsService: SelectorsService,
    private dataService: DataService,
    private historyService: HistoryService,
  ) {
    el.nativeElement.onmousedown = (evt: MouseEvent) => evt.preventDefault();
  }

  @HostListener('click')
  onClick(): void {
    if (this.selectorsService.selectors.length === 0) {
      return;
    }
    const [ri, ci] = this.selectorsService.selectors[0].startCord;
    const startCell = this.dataService.selectedSheet.getCell(ri, ci);
    const startCellText = this.dataService.selectedSheet.getCellPlainText(
      ri,
      ci,
    );
    if (!isNumber(startCellText)) {
      return;
    }
    const oldPrecision = isNil(startCell?.style?.precision)
      ? startCellText?.split('.')[1]?.length || 0
      : startCell!.style!.precision!;
    const step = this.tpe === 'add' ? 1 : -1;
    const newPrecision = oldPrecision + step;
    if (newPrecision < 0) {
      return;
    }
    this.historyService.stacked(() => {
      for (const selector of this.selectorsService.selectors) {
        this.dataService.selectedSheet.applyPrecisionTo(
          selector.range,
          newPrecision,
        );
      }
    });
    this.dataService.rerender();
  }

  ngOnInit(): void {}
}
