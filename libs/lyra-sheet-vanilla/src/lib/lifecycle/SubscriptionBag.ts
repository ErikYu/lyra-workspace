export class SubscriptionBag {
  private cleanups: Array<() => void> = [];

  add(cleanup: { unsubscribe: () => void } | (() => void)): void {
    this.cleanups.push(
      typeof cleanup === 'function' ? cleanup : () => cleanup.unsubscribe(),
    );
  }

  cleanup(): void {
    for (const cleanup of this.cleanups.splice(0)) {
      cleanup();
    }
  }
}
