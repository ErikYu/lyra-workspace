export type TextAlignDir = 'left' | 'center' | 'right';
export type TextValignDir = 'top' | 'center' | 'bottom';

export type BorderType = 'thin' | 'medium' | 'bold';
type BorderColor = string;

export interface CellStyle {
  background?: string;
  textWrap?: 'overflow' | 'wrap' | 'clip';
  valign?: TextValignDir;
  align?: TextAlignDir;
  merge?: [number, number];
  border?: {
    left?: [BorderType, BorderColor];
    right?: [BorderType, BorderColor];
    top?: [BorderType, BorderColor];
    bottom?: [BorderType, BorderColor];
  };
}
