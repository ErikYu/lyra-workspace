import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { FocusedStyleService } from '../../../../service/focused-style.service';
import { TextInputService } from '../../../../service/text-input.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { DataService } from '../../../../core/data.service';
import { HistoryService } from '../../../../service/history.service';

@Component({
  selector: 'nd-italic-action',
  templateUrl: './italic-action.component.html',
  styleUrls: ['./italic-action.component.less'],
})
export class ItalicActionComponent implements OnInit {
  @HostBinding('class.activated')
  get isItalicNow(): boolean {
    return this.focusedStyleService.hitStyle().italic || false;
  }

  constructor(
    private el: ElementRef,
    private textInputService: TextInputService,
    private focusedStyleService: FocusedStyleService,
    private selectorsService: SelectorsService,
    private dataService: DataService,
    private historyService: HistoryService,
  ) {}

  @HostListener('click')
  onClick(): void {
    if (this.textInputService.isEditing) {
      document.execCommand('italic', false);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextItalicTo(
            selector.range,
            !this.isItalicNow,
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
