export interface DatasheetConfig {
  width: number;
  height: number;
  row: {
    count: number;
    height: number;
    indexHeight: number;
  };
  col: {
    count: number;
    width: number;
    indexWidth: number;
  };
}

export interface DatasheetConfigExtended extends DatasheetConfig {
  sheetHeight: number;
  sheetWidth: number;
}
