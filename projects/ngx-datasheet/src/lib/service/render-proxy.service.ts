import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type RenderRange = 'all' | 'header';

@Injectable()
export class RenderProxyService {
  get shouldRender$(): Observable<{ type: RenderRange }> {
    return this._shouldRender$.asObservable();
  }
  private _shouldRender$ = new BehaviorSubject<{ type: RenderRange }>({
    type: 'all',
  });

  render(type: RenderRange): void {
    this._shouldRender$.next({ type });
  }
}
