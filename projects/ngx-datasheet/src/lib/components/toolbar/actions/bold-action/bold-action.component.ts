import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { TextInputService } from '../../../../service/text-input.service';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { HistoryService } from '../../../../service/history.service';
import { FocusedStyleService } from '../../../../service/focused-style.service';

@Component({
  selector: 'nd-bold-action',
  templateUrl: './bold-action.component.html',
  styleUrls: ['./bold-action.component.less'],
})
export class BoldActionComponent implements OnInit {
  @HostBinding('class.activated')
  get isBoldNow(): boolean {
    return this.focusedStyleService.hitStyle().bold || false;
  }

  constructor(
    public textInputService: TextInputService,
    private dataService: DataService,
    private selectorsService: SelectorsService,
    private historyService: HistoryService,
    private focusedStyleService: FocusedStyleService,
    private el: ElementRef,
  ) {}

  @HostListener('click')
  onClick(): void {
    if (this.textInputService.isEditing) {
      document.execCommand('bold', false);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextBoldTo(
            selector.range,
            !this.isBoldNow,
          );
        }
      });
      this.dataService.rerender();
    }
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
