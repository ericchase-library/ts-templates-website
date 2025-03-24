import { SyncAsync } from './Types.js';

export function RestartableTaskChain(
  tasks: (() => SyncAsync<void>)[],
  {
    onAbort,
    onEnd,
  }: {
    onAbort?: () => SyncAsync<void>;
    onEnd?: () => SyncAsync<void>;
  } = {},
) {
  let runlock0 = false;
  let runlock1 = false;
  let endlock0 = true;
  let endlock1 = false;
  let abort = false;
  let restart_requested = false;

  async function run() {
    if (runlock0 === false && runlock1 === false) {
      runlock0 = true;
      endlock0 = false;
      abort = false;
      restart_requested = false;
      for (const task of tasks) {
        if (abort === false) {
          await task();
        }
        // @ts-expect-error ts doesn't understand how asynchronous code works
        if (abort === true) {
          break;
        }
      }
      runlock1 = true;
      await checklocks();
    }
  }
  async function end() {
    // abort is called right away
    abort = true;
    // instant sleep for consistency
    // await Sleep(0);
    if (endlock0 === false && endlock1 === false) {
      endlock0 = true;
      await onAbort?.();
      endlock1 = true;
      await checklocks();
    }
  }
  async function checklocks() {
    if (runlock0 === false && runlock1 === false && endlock0 === true && endlock1 === false) {
      // tasks clean
      // locks clean
      if (restart_requested === true) {
        return run();
      }
    } else if (runlock0 === true && runlock1 === true && endlock0 === false && endlock1 === false) {
      // tasks were started
      // onAbort was NOT called
      // tasks NOT clean
      if (restart_requested === true) {
        return end();
      }
    } else if (runlock0 === true && runlock1 === true && endlock0 === true && endlock1 === true) {
      // tasks were started and aborted
      // onAbort was called
      // tasks clean
      // reset locks
      await onEnd?.();
      runlock0 = false;
      runlock1 = false;
      endlock0 = true;
      endlock1 = false;
      abort = false;
      if (restart_requested === true) {
        return run();
      }
    }
  }
  return {
    start() {
      restart_requested = false;
      return run();
    },
    restart() {
      if (runlock0 === false && runlock1 === false && endlock0 === true && endlock1 === false) {
        return run();
      }
      restart_requested = true;
      return end();
    },
    abort() {
      restart_requested = false;
      return end();
    },
  };
}
