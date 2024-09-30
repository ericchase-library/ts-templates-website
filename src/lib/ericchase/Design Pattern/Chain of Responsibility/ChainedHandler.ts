import { HandlerCaller, type Handler } from '../Handler.js';

export type ChainedHandler<Request = void, Actions = void> = Handler<Request, { stopHandlerChain: () => void } & Actions>;

export class ChainedHandlerCaller<Request = void, Actions = void> extends HandlerCaller<Request, { stopHandlerChain: () => void } & Actions> {
  async call(request: Request, actions: Actions) {
    let abort = false;
    for (const handler of this) {
      await handler(request, {
        ...actions,
        removeSelf: () => {
          this.remove(handler);
        },
        stopHandlerChain: () => {
          abort = true;
        },
      });
      if (abort !== false) {
        break;
      }
    }
  }
}
