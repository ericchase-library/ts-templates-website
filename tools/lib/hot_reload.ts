import { ConsoleError, ConsoleLog } from '../../src/lib/ericchase/Utility/Console.js';
import { Debouncer } from '../../src/lib/ericchase/Utility/Debounce.js';
import { on_log } from '../scripts/build.js';

export class HotReloader {
  enabled = false;
  hotreload: Debouncer<Promise<void>>;
  unsubscribe = () => {};
  readonly $reload_endpoint: string;
  constructor(reload_endpoint: string, debounce_delay = 250) {
    this.$reload_endpoint = reload_endpoint;
    this.hotreload = new Debouncer(async () => {
      await fetch(reload_endpoint);
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
        const url = new URL(this.$reload_endpoint);
        await fetch(url.host);
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
