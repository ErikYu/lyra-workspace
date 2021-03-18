import { Component, ElementRef, OnInit } from '@angular/core';
import { DEFAULT_FONT_COLOR } from '../../../../constants';
import { TextInputService } from '../../../../service/text-input.service';
import { HistoryService } from '../../../../service/history.service';
import { DataService } from '../../../../core/data.service';
import { SelectorsService } from '../../../../core/selectors.service';

@Component({
  selector: 'nd-font-color-dropdown',
  templateUrl: './font-color-dropdown.component.html',
  styleUrls: ['./font-color-dropdown.component.less'],
})
export class FontColorDropdownComponent implements OnInit {
  isOpen = false;
  get currentSelectionFontColor(): string {
    const selection = getSelection();
    if (!selection) {
      return DEFAULT_FONT_COLOR;
    }
    const fc = selection.anchorNode?.parentElement?.style?.color;
    if (!fc) {
      return DEFAULT_FONT_COLOR;
    }
    return fc;
  }
  constructor(
    private el: ElementRef,
    private textInputService: TextInputService,
    private historyService: HistoryService,
    private dataService: DataService,
    private selectorsService: SelectorsService,
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
