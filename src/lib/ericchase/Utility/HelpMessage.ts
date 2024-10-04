import { ConsoleError } from './Console.js';
import { ImmediateDebounce } from './Debounce.js';

export class HelpMessage {
  print: () => Promise<void>;
  constructor(public message: string) {
    this.print = ImmediateDebounce(() => {
      ConsoleError(this.message);
    }, 500);
  }
}
