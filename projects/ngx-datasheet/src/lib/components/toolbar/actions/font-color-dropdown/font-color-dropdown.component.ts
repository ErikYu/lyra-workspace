import { Component, ElementRef, OnInit } from '@angular/core';
import { DEFAULT_FONT_COLOR } from '../../../../constants';

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
  constructor(private el: ElementRef) {
    el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }

  applyTextColor(color: string): void {
    document.execCommand('foreColor', false, color)
    this.isOpen = false;
  }

  ngOnInit(): void {}
}
