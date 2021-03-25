import { Injectable } from '@angular/core';
import { DatasheetConfig, DatasheetConfigExtended } from '../models';

const toolbarHeight = 30;
const formulaBarHeight = 25;

@Injectable()
export class ConfigService {
  readonly tabBarHeight = 30;
  readonly scrollbarThick = 16;

  constructor() {}
  get configuration(): DatasheetConfigExtended {
    return this.config;
  }

  get defaultCW(): number {
    return this.configuration.col.width;
  }

  get defaultRH(): number {
    return this.configuration.row.height;
  }

  get rih(): number {
    return this.configuration.row.indexHeight;
  }

  get ciw(): number {
    return this.configuration.col.indexWidth;
  }

  private config!: DatasheetConfigExtended;

  setConfig(val: DatasheetConfig, container: HTMLElement): void {
    this.config = {
      ...val,
      sheetHeight:
        container.getBoundingClientRect().height -
        toolbarHeight -
        formulaBarHeight,
      sheetWidth: container.getBoundingClientRect().width,
    };
  }
}
