import { ChainedHandlerCaller, type ChainedHandler } from '../../Design Pattern/Chain of Responsibility/ChainedHandler.js';
import { Sleep } from '../../Utility/Sleep.js';

/** Don't forget to call `start()`. */
export class StdinReader<T> {
  $handler_caller = new ChainedHandlerCaller<T>();
  $listener: (data: Uint8Array) => void;
  constructor(readonly $decoder?: (data: Uint8Array) => T) {
    this.$listener = async (bytes: Uint8Array) => {
      const value = this.$decoder ? this.$decoder(bytes) : (bytes as unknown as T);
      await this.$handler_caller.call(value);
    };
  }
  addHandler(handler: ChainedHandler<T>) {
    this.$handler_caller.add(handler);
  }
  removeHandler(handler: ChainedHandler<T>) {
    this.$handler_caller.remove(handler);
  }
  reset() {
    this.$handler_caller.clear();
  }
  async start() {
    process.stdin //
      .addListener('data', this.$listener)
      .resume();
    await Sleep(0);
  }
  async stop() {
    process.stdin //
      .pause()
      .removeListener('data', this.$listener);
    await Sleep(0);
  }
}

/** Don't forget to call `start()`. */
export class StdinByteReader extends StdinReader<Uint8Array> {}

/** Don't forget to call `start()`. */
export class StdinTextReader extends StdinReader<string> {
  $textDecoder = new TextDecoder();
  constructor() {
    super((data) => this.$textDecoder.decode(data));
  }
}

/** Don't forget to call `start()`. */
export class StdinRawModeReader extends StdinReader<string> {
  private $is_raw_mode = false;
  $textDecoder = new TextDecoder();
  constructor() {
    super((data) => this.$textDecoder.decode(data));
  }
  async start() {
    if (this.$is_raw_mode === false) {
      process.stdin //
        .setRawMode(true)
        .addListener('data', this.$listener)
        .resume();
      await Sleep(0);
      this.$is_raw_mode = true;
    }
  }
  async stop() {
    if (this.$is_raw_mode === true) {
      process.stdin //
        .pause()
        .removeListener('data', this.$listener)
        .setRawMode(false);
      await Sleep(0);
      this.$is_raw_mode = false;
    }
  }
}
