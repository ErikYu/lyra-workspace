import { DatasheetConfig, DatasheetConfigExtended } from '../types';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';
import { RenderProxyService } from './render-proxy.service';
import { Lifecycle, scoped } from 'tsyringe';
import { ElementRefService } from './element-ref.service';

const toolbarHeight = 30;
const formulaBarHeight = 25;

@scoped(Lifecycle.ContainerScoped)
export class ConfigService {
  readonly tabBarHeight = 30;
  readonly scrollbarThick = 16;

  constructor(
    private renderProxyService: RenderProxyService,
    private elRef: ElementRefService,
  ) {}

  get config$(): Observable<DatasheetConfigExtended> {
    return this._config$
      .asObservable()
      .pipe(
        filter((i) => !!i, throttleTime(100)),
      ) as Observable<DatasheetConfigExtended>;
  }

  get snapshot(): DatasheetConfigExtended {
    return this._config$.value;
  }

  get defaultCW(): number {
    return this.snapshot.col.width || 100;
  }

  get defaultRH(): number {
    return this.snapshot.row.height || 25;
  }

  get rih(): number {
    return this.snapshot.row.indexHeight || 25;
  }

  get ciw(): number {
    return this.snapshot.col.indexWidth || 60;
  }

  private _config$ = new BehaviorSubject<DatasheetConfigExtended>({
    width: () => document.documentElement.clientWidth,
    height: () => document.documentElement.clientHeight,
    row: {
      height: 25,
      count: 100,
      indexHeight: 25,
    },
    col: {
      width: 100,
      count: 30,
      indexWidth: 60,
    },
    sheetHeight: 0,
    sheetWidth: 0,
  });

  resize(container: HTMLElement): void {
    this._config$.next({
      ...this.snapshot,
      sheetHeight:
        container.getBoundingClientRect().height -
        toolbarHeight -
        formulaBarHeight,
      sheetWidth: container.getBoundingClientRect().width,
    });
    this.renderProxyService.render('all');
  }

  setConfig(val: DatasheetConfig): void {
    this._config$.next({
      ...val,
      sheetHeight: val.height() - toolbarHeight - formulaBarHeight,
      sheetWidth: val.width(),
    });
    this.renderProxyService.render('all');
  }
}
