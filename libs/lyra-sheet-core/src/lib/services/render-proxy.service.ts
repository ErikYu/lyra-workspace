import { BehaviorSubject, Observable } from 'rxjs';
import { Lifecycle, scoped } from 'tsyringe';

type RenderRange = 'all' | 'header';

@scoped(Lifecycle.ContainerScoped)
export class RenderProxyService {
  shouldRender$: Observable<{ type: RenderRange }>;

  constructor() {
    this.shouldRender$ = this._shouldRender$.asObservable();
  }

  private _shouldRender$ = new BehaviorSubject<{ type: RenderRange }>({
    type: 'all',
  });

  render(type: RenderRange): void {
    this._shouldRender$.next({ type });
  }
}
