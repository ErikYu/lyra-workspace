export type TextAlignDir = 'left' | 'center' | 'right';
export type TextValignDir = 'top' | 'center' | 'bottom';

export type BorderType = 'thin' | 'medium' | 'bold';
type BorderColor = string;
export type TextWrapType = 'overflow' | 'wrap' | 'clip';
export type CellFormat =
  | undefined
  | 'text'
  | 'number'
  | 'percent'
  | 'scientific';

export interface CellStyle {
  background?: string;
  textWrap?: TextWrapType;
  valign?: TextValignDir;
  align?: TextAlignDir;
  merge?: [number, number];
  border?: {
    left?: [BorderType, BorderColor];
    right?: [BorderType, BorderColor];
    top?: [BorderType, BorderColor];
    bottom?: [BorderType, BorderColor];
  };
  format?: CellFormat;
  precision?: number | null;
}
