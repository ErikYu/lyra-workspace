import { Injectable } from '@angular/core';
import { DataService } from '../core/data.service';
import { ViewRangeService } from '../core/view-range.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocatedRect, TextStyle } from '../models';
import { RichTextLine } from '../ngx-datasheet.model';
import { HtmlToRichTextService } from './html-to-rich-text.service';

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
    const cssObject: {
      'font-weight'?: string;
      color?: string;
      'font-family'?: string;
      'font-size'?: string;
      'font-style'?: string;
      'text-decoration-line'?: string[];
    } = {};
    for (const [attr, value] of Object.entries(style || {})) {
      switch (attr as keyof TextStyle) {
        case 'bold':
          if (value) {
            cssObject['font-weight'] = 'bold';
          }
          break;
        case 'color':
          cssObject.color = value;
          break;
        case 'fontName':
          cssObject['font-family'] = value;
          break;
        case 'fontSize':
          cssObject['font-size'] = `${value}px`;
          break;
        case 'italic':
          cssObject['font-style'] = 'italic';
          break;
        case 'strike':
          if (cssObject.hasOwnProperty('text-decoration-line')) {
            cssObject['text-decoration-line']!.push('line-through');
          } else {
            cssObject['text-decoration-line'] = ['line-through'];
          }
          break;
        case 'underline':
          if (cssObject.hasOwnProperty('text-decoration-line')) {
            cssObject['text-decoration-line']!.push('underline');
          } else {
            cssObject['text-decoration-line'] = ['underline'];
          }
          break;
      }
    }
    return Object.entries(cssObject)
      .map(([attr, value]) => {
        if (Array.isArray(value)) {
          return `${attr}: ${value.join(' ')}`;
        }
        return `${attr}: ${value}`;
      })
      .join(';');
  }
}
