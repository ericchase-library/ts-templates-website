import type { SyncAsync } from '../Utility/Types.js';

export type Handler<Request = void, Actions = void> = (
  request: Request, //
  actions: { removeSelf: () => void } & Actions,
) => SyncAsync<void>;

export class HandlerSet<Request = void, Actions = void> {
  $set = new Set<Handler<Request, Actions>>();
  add(handler: Handler<Request, Actions>): () => void {
    this.$set.add(handler);
    return () => this.remove(handler);
  }
  clear(): void {
    this.$set.clear();
  }
  remove(handler: Handler<Request, Actions>): void {
    this.$set.delete(handler);
  }
  *[Symbol.iterator]() {
    for (const handler of this.$set) {
      yield handler;
    }
  }
}

export class HandlerCaller<Request = void, Actions = void> extends HandlerSet<Request, Actions> {
  async call(request: Request, actions: Actions) {
    for (const handler of this) {
      await handler(request, {
        ...actions,
        removeSelf: () => {
          this.remove(handler);
        },
      });
    }
  }
}
