import { singleton } from 'tsyringe';

@singleton()
export class DprService {
  dpr(): number {
    return window.devicePixelRatio || 1;
  }

  rpx(pxVal: number): number {
    return pxVal * this.dpr();
  }
}
