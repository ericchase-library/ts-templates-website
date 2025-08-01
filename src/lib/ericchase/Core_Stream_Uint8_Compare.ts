import { Core_Stream_Uint8_Reader_Class } from './Core_Stream_Uint8_Reader_Class.js';

export async function Async_Core_Stream_Uint8_Compare(stream1: ReadableStream<Uint8Array>, stream2: ReadableStream<Uint8Array>): Promise<boolean> {
  const one = Core_Stream_Uint8_Reader_Class(stream1.getReader());
  const two = Core_Stream_Uint8_Reader_Class(stream2.getReader());
  try {
    while (true) {
      let changed = false;
      if (one.done === false && one.i >= one.length) {
        if ((await one.next()).changed === true) {
          changed = true;
        }
      }
      if (two.done === false && two.i >= two.length) {
        if ((await two.next()).changed === true) {
          changed = true;
        }
      }
      if (one.done && two.done) {
        return true;
      }
      if (one.done !== two.done || changed === false) {
        return false;
      }
      while (one.i < one.length && two.i < two.length) {
        if (one.value[one.i] !== two.value[two.i]) {
          return false;
        }
        one.i++;
        two.i++;
      }
    }
  } finally {
    one.releaseLock();
    two.releaseLock();
  }
}
