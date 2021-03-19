import { Component, ElementRef, OnInit } from '@angular/core';
import {
  ALL_FONT_SIZE,
  DEFAULT_FONT_SIZE,
  getPtByPx,
} from '../../../../constants';
import { TextInputService } from '../../../../service/text-input.service';
import { HistoryService } from '../../../../service/history.service';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';
import { FocusedStyleService } from '../../../../service/focused-style.service';

@Component({
  selector: 'nd-font-size-dropdown',
  templateUrl: './font-size-dropdown.component.html',
  styleUrls: ['./font-size-dropdown.component.less'],
})
export class FontSizeDropdownComponent implements OnInit {
  ALL_FONT_SIZE = ALL_FONT_SIZE;
  open = false;

  get currentSelectionFontSize(): number {
    const pxSize = this.focusedStyleService.hitStyle().fontSize;
    return getPtByPx(pxSize || DEFAULT_FONT_SIZE);
  }

  constructor(
    private el: ElementRef,
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private dataService: DataService,
    private selectorsService: SelectorsService,
    private focusedStyleService: FocusedStyleService,
  ) {}

  applyFontSize(option: { pt: number; px: number }): void {
    if (this.textInputService.isEditing) {
      document.execCommand('fontSize', false, '1');
      const spans = document
        .querySelector('.nd-rich-text-input-area')!
        .querySelectorAll('span');
      spans.forEach((span) => {
        if (span.style.fontSize === 'x-small') {
          span.style.fontSize = `${option.px}px`;
        }
      });
    } else {
      this.historyService.stacked(() => {
        for (const selector of this.selectorsService.selectors) {
          this.dataService.selectedSheet.applyTextSizeTo(
            selector.range,
            option.px,
          );
        }
      });
      this.dataService.rerender();
    }
    this.open = false;
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
