import { Injectable } from '@angular/core';
import { TextStyle } from '../models';
import { TextInputService } from './text-input.service';
import { DataService } from '../core/data.service';
import { SelectorsService } from '../core/selectors.service';
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
} from '../constants';
import { pxStr2Num } from '../utils';

@Injectable()
export class FocusedStyleService {
  constructor(
    private textInputService: TextInputService,
    private dataService: DataService,
    private selectorsService: SelectorsService,
  ) {}

  hitStyle(): TextStyle {
    if (this.textInputService.isEditing) {
      const selection = getSelection();
      if (!selection) {
        return {};
      }
      const style: Partial<CSSStyleDeclaration> = getComputedStyle(
        selection.anchorNode!.parentElement!,
      );
      const res: TextStyle = {};
      if (style.fontWeight !== '400') {
        res.bold = true;
      }
      if (style.fontStyle === 'italic') {
        res.italic = true;
      }
      if (style.textDecorationLine?.includes('line-through')) {
        res.strike = true;
      }
      if (style.textDecorationLine?.includes('underline')) {
        res.underline = true;
      }
      if (style.fontSize !== `${DEFAULT_FONT_SIZE}px`) {
        res.fontSize = pxStr2Num(style.fontSize!);
      }
      if (style.color !== DEFAULT_FONT_COLOR) {
        res.color = style.color;
      }
      if (
        style.fontFamily !== DEFAULT_FONT_FAMILY &&
        !style.fontFamily?.includes(',')
      ) {
        res.fontName = style.fontFamily;
      }
      return res;
    } else {
      if (this.selectorsService.selectors.length === 0) {
        return {};
      } else {
        const [ri, ci] = this.selectorsService.selectors[0].startCord;
        const richText = this.dataService.selectedSheet.getCell(ri, ci)
          ?.richText;
        if (
          Array.isArray(richText) &&
          richText.length > 0 &&
          richText[0].length > 0
        ) {
          const { style } = richText[0][0];
          return style || {};
        }
        return {};
      }
    }
  }
}
