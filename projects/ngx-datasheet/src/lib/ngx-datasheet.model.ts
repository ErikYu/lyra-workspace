import { CellStyle, TextStyle } from './models';

export interface RichTextSpan {
  style?: TextStyle;
  text: string;
}

export type RichTextLine = Array<RichTextSpan>;

export interface NDCellData {
  style?: CellStyle;
  richText?: Array<RichTextLine>;
  _preFormat?: 'text' | 'number';
}

type RowIndex = number;
type ColIndex = number;
type LeftTop = [RowIndex, ColIndex];
type RightBottom = [RowIndex, ColIndex];
export type Merge = [LeftTop, RightBottom];
export interface NDSheetData {
  merges: Merge[];

  rows: {
    [rowKey: number]: {
      height?: number;
      cells: {
        [colKey: number]: NDCellData;
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

export interface NDSheet {
  name: string;
  data: NDSheetData;
  selected?: boolean;
}

export interface NDData {
  sheets: Array<NDSheet>;
}
