import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {SelectorsService} from '../core/selectors.service';
import {DataService} from '../core/data.service';

interface LocatedContextmenu {
  left: number;
  top: number;
  // mode: 'row' | 'col' | 'cell';
}

@Injectable()
export class ContextmenuService {
  private _options$ = new BehaviorSubject<LocatedContextmenu | null>(null);

  get options$(): Observable<LocatedContextmenu | null> {
    return this._options$.asObservable();
  }

  constructor(
    private selectorsService: SelectorsService,
    private dataService: DataService,
  ) {}

  show(left: number, top: number): void {
    this._options$.next({left, top});
  }

  hide(): void {
    this._options$.next(null);
  }
}
