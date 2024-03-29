import { RichTextLine } from '../types';
import { CanvasService } from './canvas.service';
import { isNumber, plainTextFromLines } from '../utils';
import Big from 'big.js';
import dayjs from 'dayjs';
import { Lifecycle, scoped } from 'tsyringe';

@scoped(Lifecycle.ContainerScoped)
export class LineWrapService {
  constructor(private canvasService: CanvasService) {}

  // TODO: Chinese characters should be wrap at any where
  // TODO: measureText can be optimized in the future
  lineWrapBuilder(lines: RichTextLine[], width: number): RichTextLine[] {
    const res: RichTextLine[] = [];
    for (const spans of lines) {
      let emptyLeft = width;
      let tempLine: RichTextLine = [];
      spans.forEach((span, spanIndex) => {
        const words = span.text.split(' ');
        this.canvasService.textStyle(span.style);
        words.forEach((word, wordIndex, { length }) => {
          // except the first word, all other words should add one `space` when calculating
          const realWord = wordIndex === 0 ? word : ` ${word}`;
          const wordWidth = this.canvasService.measureTextWidth(realWord);

          // when it comes to the last word of this span,
          // we need to check the next span's first word.
          // if these two `word` can be merged in to one word
          // pre calc the width of next-span's first-word.
          // just like the variable `fw`
          //
          // example:
          // [{text: 'i am a hero wh'}, {text: 'ose name is Superman', style: {color: 'red'}}]
          // `wh` and `ose` should be treated as one word when applying text-wrap
          let robbedWordWidth = 0;
          if (wordIndex === length - 1) {
            const shouldRobNextSpanStartWord =
              !span.text.endsWith(' ') &&
              spanIndex <= spans.length - 2 &&
              !spans[spanIndex + 1].text.startsWith(' ');
            if (shouldRobNextSpanStartWord) {
              const fw = spans[spanIndex + 1].text.split(' ')[0];
              this.canvasService.textStyle(spans[spanIndex + 1].style);
              robbedWordWidth = this.canvasService.measureTextWidth(fw);
            }
          }

          const emptyWillLeft = emptyLeft - (wordWidth + robbedWordWidth);
          if (emptyWillLeft >= 0) {
            tempLine.push({ text: realWord, style: span.style });
            emptyLeft -= wordWidth;
          } else {
            res.push(tempLine);
            tempLine = [];
            emptyLeft = width;
            if (wordWidth <= width) {
              emptyLeft -= wordWidth;
              // only for those wrap-generated-new-line's first word, use trimLeft to remove the start-space
              tempLine.push({ text: realWord.trimLeft(), style: span.style });
            } else {
              tempLine.push({ text: '', style: span.style });
              word.split('').forEach((char) => {
                const charWidth = this.canvasService.measureTextWidth(char);
                emptyLeft -= charWidth;
                if (emptyLeft >= 0) {
                  tempLine[0].text += char;
                } else {
                  res.push(tempLine);
                  tempLine = [{ text: '', style: span.style }];
                  emptyLeft = width - charWidth;
                  tempLine[0].text += char;
                }
              });
            }
          }
        });
      });
      res.push(tempLine);
    }
    return res;
  }

  convOnPrecision(lines: RichTextLine[], precision: number): RichTextLine[] {
    if (lines.length === 1 && lines[0].length === 1) {
      const { text, style } = lines[0][0];
      return [[{ text: `${Big(text).toFixed(precision)}`, style }]];
    }
    return lines;
  }

  convOnPercent(lines: RichTextLine[]): RichTextLine[] {
    if (this.isNumberedLines(lines)) {
      const { text, style } = lines[0][0];
      return [[{ text: `${Big(text).times(100)}%`, style }]];
    }
    return lines;
  }

  convOnScientific(lines: RichTextLine[]): RichTextLine[] {
    if (this.isNumberedLines(lines)) {
      const { text, style } = lines[0][0];
      return [[{ text: `${Big(text).toExponential(2)}`, style }]];
    }
    return lines;
  }

  convOnAccounting(lines: RichTextLine[]): RichTextLine[] {
    if (this.isNumberedLines(lines)) {
      const { text, style } = lines[0][0];
      return [[{ text: `${Big(text).toFixed(2)}`, style }]];
    }
    return lines;
  }

  convOnCurrency(lines: RichTextLine[]): RichTextLine[] {
    if (this.isNumberedLines(lines)) {
      const { text, style } = lines[0][0];
      return [[{ text: `$${Big(text).toFixed(2)}`, style }]];
    }
    return lines;
  }

  convOnCurrencyRounded(lines: RichTextLine[]): RichTextLine[] {
    if (this.isNumberedLines(lines)) {
      const { text, style } = lines[0][0];
      return [[{ text: `$${Big(text).toFixed(0)}`, style }]];
    }
    return lines;
  }

  convOnFinancial(lines: RichTextLine[]): RichTextLine[] {
    if (this.isNumberedLines(lines)) {
      const { text, style } = lines[0][0];
      return [[{ text: `${Big(text).toFixed(2)}`, style }]];
    }
    return lines;
  }

  convOnDate(lines: RichTextLine[]): RichTextLine[] {
    const plainText = plainTextFromLines(lines);
    const d = dayjs(plainText).format('M/D/YYYY');
    return [[{ text: d, style: lines[0][0]?.style }]];
  }

  convOnTime(lines: RichTextLine[]): RichTextLine[] {
    const plainText = plainTextFromLines(lines);
    const d = dayjs(plainText).format('h:mm:ss A');
    return [[{ text: d, style: lines[0][0]?.style }]];
  }

  convOnDateTime(lines: RichTextLine[]): RichTextLine[] {
    const plainText = plainTextFromLines(lines);
    const d = dayjs(plainText).format('M/D/YYYY H:mm:ss');
    return [[{ text: d, style: lines[0][0]?.style }]];
  }

  private isNumberedLines(lines: RichTextLine[]): boolean {
    return (
      lines.length === 1 && lines[0].length === 1 && isNumber(lines[0][0].text)
    );
  }
}
