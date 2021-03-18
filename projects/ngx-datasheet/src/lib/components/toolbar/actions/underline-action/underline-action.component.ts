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
  selector: 'nd-underline-action',
  templateUrl: './underline-action.component.html',
  styleUrls: ['./underline-action.component.less'],
})
export class UnderlineActionComponent implements OnInit {
  @HostBinding('class.activated')
  get isUnderlineNow(): boolean {
    return this.focusedStyleService.hitStyle().underline || false;
  }
  constructor(
    private el: ElementRef,
    private textInputService: TextInputService,
    private dataService: DataService,
    private selectorsService: SelectorsService,
    private historyService: HistoryService,
    private focusedStyleService: FocusedStyleService,
  ) {}

  @HostListener('click')
  onClick(): void {
    if (this.textInputService.isEditing) {
      document.execCommand('underline', false);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextUnderlineTo(
            selector.range,
            !this.isUnderlineNow,
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
