import { RichTextLine } from '../ngx-datasheet.model';

export function plainTextFromLines(lines: RichTextLine[]): string {
  let res = '';
  for (const line of lines) {
    for (const span of line) {
      res += span.text;
    }
  }
  return res;
}
