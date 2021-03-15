import { Component, ElementRef, OnInit } from '@angular/core';
import { ALL_FONT_FAMILY, DEFAULT_FONT_FAMILY } from '../../../../constants';

@Component({
  selector: 'nd-font-family-dropdown',
  templateUrl: './font-family-dropdown.component.html',
  styleUrls: ['./font-family-dropdown.component.less'],
})
export class FontFamilyDropdownComponent implements OnInit {
  ALL_FONT_FAMILY = ALL_FONT_FAMILY;
  open = false;

  constructor(private el: ElementRef) {
    el.nativeElement.onmousedown = (evt: any) => evt.preventDefault();
  }

  get currentSelectionFontFamily(): string {
    const selection = getSelection();
    if (!selection) {
      return DEFAULT_FONT_FAMILY;
    }
    const fm = selection.anchorNode?.parentElement?.style?.fontFamily;
    if (!fm) {
      return DEFAULT_FONT_FAMILY;
    }
    return fm;
  }

  applyFontFamily(ff: string): void {
    document.execCommand('fontName', false, ff);
  }

  ngOnInit(): void {}
}
