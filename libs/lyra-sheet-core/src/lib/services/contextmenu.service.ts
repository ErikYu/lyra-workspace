import { BehaviorSubject, Observable } from 'rxjs';
import { Lifecycle, scoped } from 'tsyringe';

interface LocatedContextmenu {
  left: number;
  top: number;
  // mode: 'row' | 'col' | 'cell';
}

@scoped(Lifecycle.ContainerScoped)
export class ContextmenuService {
  private _options$ = new BehaviorSubject<LocatedContextmenu | null>(null);
  get options$(): Observable<LocatedContextmenu | null> {
    return this._options$.asObservable();
  }

  constructor() {}

  show(left: number, top: number): void {
    this._options$.next({ left, top });
  }

  hide(): void {
    this._options$.next(null);
  }
}
