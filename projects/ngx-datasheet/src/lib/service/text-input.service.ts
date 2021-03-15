import { Injectable } from '@angular/core';
import { DataService } from '../core/data.service';
import { ViewRangeService } from '../core/view-range.service';
import {BehaviorSubject, from, Observable, Subject} from 'rxjs';
import { LocatedRect, TextStyle } from '../models';
import { RichTextLine } from '../ngx-datasheet.model';
import { HtmlToRichTextService } from './html-to-rich-text.service';
import {map, pairwise, tap} from 'rxjs/operators';

interface RichTextInputRect extends LocatedRect {
  html: string;
}

@Injectable()
export class TextInputService {
  private _locatedRect$ = new BehaviorSubject<RichTextInputRect | null>(null);

  get locatedRect$(): Observable<RichTextInputRect | null> {
    return this._locatedRect$.asObservable();
  }

  constructor(
    private dataService: DataService,
    private vs: ViewRangeService,
    private htmlToRichTextService: HtmlToRichTextService,
  ) {}

  show(
    sri: number,
    sci: number,
    eri: number,
    eci: number,
    text: RichTextLine[] | undefined,
  ): void {
    const locatedRect = this.vs.locateRect({ sci, eci, sri, eri });
    const html = this.richTextToHTML(text);
    this._locatedRect$.next({ ...locatedRect, html });
  }

  hide(): void {
    if (this._locatedRect$.value !== null) {
      const { sri, sci } = this._locatedRect$.value;
      this.dataService.selectedSheet.applyRichTextToCell(
        sri,
        sci,
        this.htmlToRichTextService.fetchRichText(),
      );
      this._locatedRect$.next(null);
    }
  }

  private richTextToHTML(textLines: RichTextLine[] | undefined): string {
    let res = '';
    for (const line of textLines || []) {
      res += '<div>';
      if (line.length === 0) {
        continue;
      } else {
        for (const span of line) {
          res += `<span style="${this.richStyleToCssStyle(span.style)}">${
            span.text === '\n' ? '<br/>' : span.text
          }</span>`;
        }
      }
      res += '</div>';
    }
    return res;
  }

  private richStyleToCssStyle(style: TextStyle | undefined): string {
    return Object.entries(style || {}).reduce<string>((prev, [attr, value]) => {
      switch (attr as keyof TextStyle) {
        case 'bold':
          if (value) {
            return `${prev} font-weight: bold;`;
          }
          return prev;
        case 'color':
          return `${prev} color: ${value};`;
        case 'fontName':
          return `${prev} font-family: ${value};`;
        case 'fontSize':
          return `${prev} font-size: ${value}px;`;
        case 'italic':
          return value ? `${prev} font-style: italic;` : prev;
        default:
          return prev;
      }
    }, '');
  }
}
