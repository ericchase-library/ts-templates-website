import { ConsoleError } from 'src/lib/ericchase/Utility/Console.js';
import { ImmediateDebounce } from 'src/lib/ericchase/Utility/Debounce.js';

export class HelpMessage {
  print: () => Promise<void>;
  constructor(public message: string) {
    this.print = ImmediateDebounce(() => {
      ConsoleError(this.message);
    }, 500);
  }
}
