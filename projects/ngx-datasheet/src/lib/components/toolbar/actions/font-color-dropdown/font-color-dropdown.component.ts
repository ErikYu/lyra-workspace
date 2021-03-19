import { Component, ElementRef, OnInit } from '@angular/core';
import { DEFAULT_FONT_COLOR } from '../../../../constants';
import { TextInputService } from '../../../../service/text-input.service';
import { HistoryService } from '../../../../service/history.service';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { FocusedStyleService } from '../../../../service/focused-style.service';

@Component({
  selector: 'nd-font-color-dropdown',
  templateUrl: './font-color-dropdown.component.html',
  styleUrls: ['./font-color-dropdown.component.less'],
})
export class FontColorDropdownComponent implements OnInit {
  isOpen = false;
  get currentSelectionFontColor(): string {
    return this.focusedStyleService.hitStyle().color || DEFAULT_FONT_COLOR;
  }
  constructor(
    private el: ElementRef,
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private dataService: DataService,
    private selectorsService: SelectorsService,
    private focusedStyleService: FocusedStyleService,
  ) {
    el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }

  applyTextColor(color: string): void {
    if (this.textInputService.isEditing) {
      document.execCommand('foreColor', false, color);
    } else {
      this.historyService.stacked(() => {
        for (const st of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextColorTo(st.range, color);
        }
      });
      this.dataService.rerender();
    }
    this.isOpen = false;
  }

  ngOnInit(): void {}
}
