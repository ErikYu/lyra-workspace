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
  | 'scientific'
  | 'accounting'
  | 'currency'
  | 'currency_rounded'
  | 'financial'
  | 'date'
  | 'time'
  | 'datetime';

export interface CellStyle {
  background?: string;
  textWrap?: TextWrapType;
  valign?: TextValignDir;
  align?: TextAlignDir;
  merge?: [number, number]; // row, col
  border?: {
    left?: [BorderType, BorderColor];
    right?: [BorderType, BorderColor];
    top?: [BorderType, BorderColor];
    bottom?: [BorderType, BorderColor];
  };
  format?: CellFormat;
  precision?: number | null;
}
