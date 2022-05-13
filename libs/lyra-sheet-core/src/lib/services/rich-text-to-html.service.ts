import { RichTextLine, TextStyle } from '../types';
import { Lifecycle, scoped } from 'tsyringe';

@scoped(Lifecycle.ContainerScoped)
export class RichTextToHtmlService {
  conv(textLines: RichTextLine[] | undefined): string {
    let res = '';
    for (const line of textLines || []) {
      if (line.length === 0) {
        continue;
      } else {
        res += '<div>';
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
          if (value) {
            cssObject['font-style'] = 'italic';
          }
          break;
        case 'strike':
          if (value) {
            if (Reflect.has(cssObject, 'text-decoration-line')) {
              cssObject['text-decoration-line']!.push('line-through');
            } else {
              cssObject['text-decoration-line'] = ['line-through'];
            }
          }
          break;
        case 'underline':
          if (Reflect.has(cssObject, 'text-decoration-line')) {
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
