export interface Rect {
  sri: number;
  sci: number;
  eri: number;
  eci: number;
}

export interface LocatedRect extends Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}
