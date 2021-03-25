import { RichTextLine } from '../ngx-datasheet.model';

export function isNumber(val: string | number | undefined | null): boolean {
  return !isNaN(val as any);
}

export function isNumberedLines(lines: RichTextLine[] | undefined): boolean {
  return (
    Array.isArray(lines) &&
    lines.length === 1 &&
    lines[0].length === 1 &&
    isNumber(lines[0][0].text)
  );
}
