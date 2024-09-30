import { Once, OptionalStore, Store, type SubscriptionCallback } from '../Design Pattern/Observer/Store.js';

export class Debouncer<Output, Input = undefined> {
  constructor(
    protected fn: (input?: Input) => Output | undefined,
    protected delay = 250,
    protected queueStrategy = (inputs: (Input | undefined)[]) => {
      return inputs.filter((_) => _).at(-1);
    },
  ) {}
  async run(input?: Input): Promise<Output | undefined> {
    if ((await this.running.get()) === false) {
      this.currentQueue.push(input);
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => this.timeout(), this.delay)[Symbol.toPrimitive]();
    } else {
      this.nextQueue.push(input);
      await Once(this.running);
    }
    return Once(this.store);
  }
  subscribe(callback: SubscriptionCallback<Output | undefined>) {
    this.store.subscribe(callback);
  }
  protected running = new Store(false, true);
  protected store = new OptionalStore<Output>();
  protected timer: number | undefined = undefined;
  protected currentQueue: (Input | undefined)[] = [];
  protected nextQueue: (Input | undefined)[] = [];
  protected async timeout() {
    this.running.set(true);
    this.store.set(await this.fn(this.queueStrategy(this.currentQueue)));
    this.running.set(false);
    this.currentQueue = this.nextQueue;
    this.nextQueue.length = 0;
    if (this.currentQueue.length > 0) {
      this.timer = setTimeout(() => this.timeout(), this.delay)[Symbol.toPrimitive]();
    }
  }
}
