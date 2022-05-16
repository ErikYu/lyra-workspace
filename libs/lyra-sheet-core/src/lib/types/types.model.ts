import { TextStyle } from './text-style.model';
import { CellStyle } from './cell-style.model';

export interface RichTextSpan {
  style?: TextStyle;
  text: string;
}

export type RichTextLine = Array<RichTextSpan>;

export interface CellData {
  style?: CellStyle;
  richText?: Array<RichTextLine>;
  _preFormat?: 'text' | 'number';
  _calcRect?: { width?: number; height?: number };
}

type RowIndex = number;
type ColIndex = number;
type LeftTop = [RowIndex, ColIndex];
type RightBottom = [RowIndex, ColIndex];
export type Merge = [LeftTop, RightBottom];
export interface SheetData {
  merges: Merge[];

  rows: {
    [rowKey: number]: {
      height?: number;
      cells: {
        [colKey: number]: CellData;
      };
    };
  };
  rowCount: number;

  cols: {
    [colKwy: number]: {
      width: number;
    };
  };
  colCount: number;
}

export interface Sheet {
  name: string;
  data: SheetData;
  selected?: boolean;
}

export interface Data {
  sheets: Array<Sheet>;
}
