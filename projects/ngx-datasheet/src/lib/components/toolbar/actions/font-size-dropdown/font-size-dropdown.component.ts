import { Component, ElementRef, OnInit } from '@angular/core';
import {
  ALL_FONT_SIZE,
  DEFAULT_FONT_SIZE,
  getPtByPx,
} from '../../../../constants';
import { pxStr2Num } from '../../../../utils';

@Component({
  selector: 'nd-font-size-dropdown',
  templateUrl: './font-size-dropdown.component.html',
  styleUrls: ['./font-size-dropdown.component.less'],
})
export class FontSizeDropdownComponent implements OnInit {
  ALL_FONT_SIZE = ALL_FONT_SIZE;
  constructor(private el: ElementRef) {}
  open = false;
  get currentSelectionFontSize(): number {
    const selection = getSelection();
    if (!selection) {
      return getPtByPx(DEFAULT_FONT_SIZE);
    }
    const fs = selection.anchorNode?.parentElement?.style?.fontSize;
    if (!fs) {
      return getPtByPx(DEFAULT_FONT_SIZE);
    }
    return getPtByPx(pxStr2Num(fs));
  }

  applyFontSize(evt: MouseEvent, option: { pt: number; px: number }): void {
    evt.preventDefault();
    document.execCommand('fontSize', false, '1');
    const spans = document
      .querySelector('.nd-rich-text-input-area')!
      .querySelectorAll('span');
    spans.forEach((span) => {
      if (span.style.fontSize === 'x-small') {
        span.style.fontSize = `${option.px}px`;
      }
    });
    this.open = false;
  }

  ngOnInit(): void {
    this.el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }
}
