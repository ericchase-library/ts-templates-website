type RefCounterCallback = () => void;

export class RefCounter {
  protected locks = new Set<object>();
  protected callbacks = new Set<RefCounterCallback>();
  lock() {
    const lock = {};
    this.locks.add(lock);
    return () => {
      if (this.locks.delete(lock) && this.locks.size === 0) {
        for (const callback of this.callbacks) {
          this.callbacks.delete(callback);
          callback();
        }
      }
    };
  }
  onZeroLocks(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.locks.size > 0) {
        this.callbacks.add(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
