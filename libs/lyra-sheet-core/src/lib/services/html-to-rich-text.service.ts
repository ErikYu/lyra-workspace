import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from '../constants';
import { RichTextLine, RichTextSpan, TextStyle } from '../types';
import { pxStr2Num, toHEX } from '../utils';
import { Lifecycle, scoped } from 'tsyringe';
import { ElementRefService } from './element-ref.service';

@scoped(Lifecycle.ContainerScoped)
export class HtmlToRichTextService {
  styledContext!: Required<TextStyle>;

  result!: RichTextLine[];

  constructor(private elRef: ElementRefService) {}

  fetchRichText(): RichTextLine[] {
    const allNodes = Array.from(
      this.elRef.rootEl.querySelector('.lyra-sheet-rich-text-input-area')!
        .childNodes,
    );
    this.reset();
    this.htmlToRichText(allNodes);
    return this.result;
  }

  private reset(): void {
    this.styledContext = {
      bold: false,
      italic: false,
      strike: false,
      fontSize: DEFAULT_FONT_SIZE,
      fontName: DEFAULT_FONT_FAMILY,
      color: '#000000',
      underline: false,
    };
    this.result = [[]];
  }

  private htmlToRichText(nodes: Node[]): void {
    for (const [index, node] of Object.entries(nodes)) {
      if (node.childNodes.length > 0) {
        if (node.nodeName === 'DIV' && index !== '0') {
          this.result.push([]);
        }
        this.htmlToRichText(Array.from(node.childNodes));
      } else {
        switch (node.nodeName) {
          case '#text':
            this.pushToLastLine({
              style: this.buildStyle(getComputedStyle(node.parentElement!)),
              text: node.nodeValue || '',
            });
            break;
          case 'BR':
            this.pushToLastLine({
              style: this.buildStyle(getComputedStyle(node.parentElement!)),
              text: '\n',
            });
            break;
        }
      }
    }
  }

  private pushToLastLine(...spans: RichTextSpan[]): void {
    this.result[this.result.length - 1].push(...spans);
  }

  // tslint:disable-next-line:typedef
  private buildStyle(css: CSSStyleDeclaration | undefined) {
    if (!css) {
      return undefined;
    }
    const res: TextStyle = {};
    if (css.fontWeight === '700') {
      res.bold = true;
    }
    if (css.fontStyle === 'italic') {
      res.italic = true;
    }
    if (css.textDecorationLine.includes('line-through')) {
      res.strike = true;
    }
    if (css.textDecorationLine.includes('underline')) {
      res.underline = true;
    }
    if (pxStr2Num(css.fontSize) !== DEFAULT_FONT_SIZE) {
      res.fontSize = pxStr2Num(css.fontSize);
    }
    if (css.fontFamily !== DEFAULT_FONT_FAMILY) {
      res.fontName = css.fontFamily;
    }
    if (toHEX(css.color) !== '#000000') {
      res.color = toHEX(css.color);
    }
    return Object.keys(res).length > 0 ? res : undefined;
  }
}
