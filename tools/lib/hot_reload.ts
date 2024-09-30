import { server_http } from '../../src/dev_server/server-data.js';
import { ConsoleError, ConsoleLog } from '../../src/lib/ericchase/Utility/Console.js';
import { Debouncer } from '../../src/lib/ericchase/Utility/Debounce.js';
import { on_log } from '../scripts/build.js';

export class HotReloader {
  enabled = false;
  hotreload: Debouncer<Promise<void>>;
  unsubscribe = () => {};
  constructor(debounce_delay = 250) {
    this.hotreload = new Debouncer(async () => {
      await fetch(`${server_http}/server/reload`);
    }, debounce_delay);
  }
  disable() {
    if (this.enabled === true) {
      this.unsubscribe();
      this.unsubscribe = () => {};
      this.enabled = false;
      ConsoleError('Hot Reloading: OFFLINE');
    }
  }
  async enable() {
    if (this.enabled === false) {
      try {
        await fetch(server_http);
        this.enabled = true;
        this.unsubscribe = on_log.subscribe(() => this.hotreload.run());
        ConsoleError('Hot Reloading: ONLINE');
      } catch (error) {
        ConsoleError('Hot Reloading: OFFLINE');
        ConsoleLog('Is server running? (`bun run serve`)');
      }
    }
  }
  async toggle() {
    switch (this.enabled) {
      case true:
        this.disable();
        break;
      case false:
        this.enable();
        break;
    }
  }
}
