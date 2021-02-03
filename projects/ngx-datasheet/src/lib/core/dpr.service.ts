import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DprService {
  dpr(): number {
    return window.devicePixelRatio || 1;
  }

  rpx(pxVal: number): number {
    return pxVal * this.dpr();
  }
}
