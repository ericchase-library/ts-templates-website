import { SubscriptionCallback } from './ObserverCallbacks.js';

export class Observable<Value> {
  public notify(data: Value): void {
    for (const callback of this.callbackSet) {
      callback(data, () => {
        this.callbackSet.delete(callback);
        if (this.callbackSet.size === 0) {
          // do some cleanup
        }
      });
    }
  }
  public observe(callback: SubscriptionCallback<Value>): () => void {
    this.callbackSet.add(callback);
    if (this.callbackSet.size === 1) {
      // do some init
    }
    return () => {
      this.callbackSet.delete(callback);
      if (this.callbackSet.size === 0) {
        // do some cleanup
      }
    };
  }
  protected callbackSet = new Set<SubscriptionCallback<Value>>();
}
