import { KEYS } from '../../src/lib/ericchase/Platform/Node/Shell.js';
import { ConsoleError, ConsoleLog } from '../../src/lib/ericchase/Utility/Console.js';
import { Debounce } from '../../src/lib/ericchase/Utility/Debounce.js';
import { on_log } from '../scripts/build.js';

export class HotReloader {
  $host: string;
  $enabled = false;
  $reload: () => Promise<void>;
  unsubscribe = () => {};
  constructor(reload_endpoint: string, debounce_delay_ms = 250) {
    this.$host = new URL('/', reload_endpoint).toString();
    this.$reload = Debounce(async () => {
      await fetch(reload_endpoint);
    }, debounce_delay_ms);
  }
  disable() {
    if (this.$enabled === true) {
      this.unsubscribe();
      this.unsubscribe = () => {};
      this.$enabled = false;
      ConsoleError('Hot Reloading Offline');
    }
  }
  async enable() {
    if (this.$enabled === false) {
      try {
        await fetch(this.$host);
        this.$enabled = true;
        this.unsubscribe = on_log.subscribe(() => this.$reload());
        ConsoleLog(`${KEYS.CSI}1;34;32mHot Reloading Online${KEYS.CSI}1;34;39m`);
      } catch (error) {
        ConsoleError('Hot Reloading Offline: Is server running? (`bun run serve`)');
      }
    }
  }
  async toggle() {
    switch (this.$enabled) {
      case true:
        this.disable();
        break;
      case false:
        this.enable();
        break;
    }
  }
}
