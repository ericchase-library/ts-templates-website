import node_fs from 'node:fs';

import type { Path, PathGroup } from './Path.js';

export type ObserverCallback = (events: node_fs.promises.FileChangeInfo<string>[], unsubscribe: () => void) => void;
export type UnobserveFn = () => void;

export class Watcher {
  /**
   * @param debounce_interval 0
   * @param recursive true
   */
  constructor(
    path: Path | PathGroup,
    public debounce_interval = 0,
    recursive = true,
  ) {
    // Debounced Event Notification
    let calling = false;
    let events: node_fs.promises.FileChangeInfo<string>[] = [];
    let timer = setTimeout(() => {});
    const enqueue = (event: node_fs.promises.FileChangeInfo<string>) => {
      events.push(event);
      if (calling === false) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (calling === false) {
            calling = true;
            clearTimeout(timer);
            this.notify(events);
            events = [];
            clearTimeout(timer);
            calling = false;
          }
        }, debounce_interval);
      }
    };
    this.done = (async () => {
      try {
        for await (const event of node_fs.promises.watch(path.path, {
          recursive,
          signal: this.controller.signal,
        })) {
          enqueue(event);
        }
      } catch (err) {}
    })();
  }
  public abort() {
    this.controller.abort();
  }
  public observe(callback: ObserverCallback): UnobserveFn {
    this.callbackSet.add(callback);
    return () => {
      this.callbackSet.delete(callback);
    };
  }
  public readonly done: Promise<void>;
  protected callbackSet = new Set<ObserverCallback>();
  protected controller = new AbortController();
  protected notify(events: node_fs.promises.FileChangeInfo<string>[]): void {
    for (const callback of this.callbackSet) {
      callback(events, () => {
        this.callbackSet.delete(callback);
      });
    }
  }
}
