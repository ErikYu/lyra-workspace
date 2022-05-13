import { RichTextLine } from '../types';

export function plainTextFromLines(lines: RichTextLine[]): string {
  let res = '';
  for (const line of lines) {
    for (const span of line) {
      res += span.text;
    }
  }
  return res;
}
