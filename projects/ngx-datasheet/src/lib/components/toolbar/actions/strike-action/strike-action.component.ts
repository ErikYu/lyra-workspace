import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { HistoryService } from '../../../../service/history.service';
import { FocusedStyleService } from '../../../../service/focused-style.service';
import { TextInputService } from '../../../../service/text-input.service';

@Component({
  selector: 'nd-strike-action',
  templateUrl: './strike-action.component.html',
  styleUrls: ['./strike-action.component.less'],
})
export class StrikeActionComponent implements OnInit {
  @HostBinding('class.activated')
  get isStrikeNow(): boolean {
    return this.focusedStyleService.hitStyle().strike || false;
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
      document.execCommand('strikethrough', false);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextStrikeTo(
            selector.range,
            !this.isStrikeNow,
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
