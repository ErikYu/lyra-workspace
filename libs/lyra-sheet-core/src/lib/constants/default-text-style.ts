import { TextStyle } from '../types';

export const DEFAULT_FONT_SIZE = 12; // unit: px
export const DEFAULT_FONT_FAMILY = 'Arial';
export const DEFAULT_FONT_COLOR = '#000000';

export const DEFAULT_TEXT_STYLE: TextStyle = {
  bold: false,
  italic: false,
  strike: false,
  fontSize: DEFAULT_FONT_SIZE,
  fontName: DEFAULT_FONT_FAMILY,
  color: DEFAULT_FONT_COLOR,
};
