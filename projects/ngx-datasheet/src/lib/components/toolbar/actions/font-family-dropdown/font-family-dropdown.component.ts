import { Component, ElementRef, OnInit } from '@angular/core';
import { ALL_FONT_FAMILY, DEFAULT_FONT_FAMILY } from '../../../../constants';
import { TextInputService } from '../../../../service/text-input.service';
import { HistoryService } from '../../../../service/history.service';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { FocusedStyleService } from '../../../../service/focused-style.service';

@Component({
  selector: 'nd-font-family-dropdown',
  templateUrl: './font-family-dropdown.component.html',
  styleUrls: ['./font-family-dropdown.component.less'],
})
export class FontFamilyDropdownComponent implements OnInit {
  ALL_FONT_FAMILY = ALL_FONT_FAMILY;
  open = false;

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

  get currentSelectionFontFamily(): string {
    const ff = this.focusedStyleService.hitStyle().fontName;
    return ff || DEFAULT_FONT_FAMILY;
  }

  applyFontFamily(ff: string): void {
    if (this.textInputService.isEditing) {
      document.execCommand('fontName', false, ff);
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextFontFamilyTo(
            selector.range,
            ff,
          );
        }
      });
      this.dataService.rerender();
    }
  }

  ngOnInit(): void {}
}
