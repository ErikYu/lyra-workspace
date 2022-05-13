import { RichTextLine } from '../types';

export function isNumber(val: string | number | undefined | null): boolean {
  return !isNaN(val as never);
}

export function isNumberedLines(lines: RichTextLine[] | undefined): boolean {
  return (
    Array.isArray(lines) &&
    lines.length === 1 &&
    lines[0].length === 1 &&
    isNumber(lines[0][0].text)
  );
}
