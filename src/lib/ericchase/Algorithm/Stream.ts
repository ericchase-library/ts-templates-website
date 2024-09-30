import { SplitLines } from '../Utility/String.js';
import { U8, U8Concat, U8Take } from './Uint8Array.js';

export async function* AsyncReader<T>(stream: ReadableStream<T>) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* AsyncLineReader(stream: ReadableStream<Uint8Array>): AsyncGenerator<string[]> {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
  try {
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.length > 0) {
          yield [buffer];
        }
        return;
      }
      const lines = SplitLines(buffer + value);
      buffer = lines[lines.length - 1] ?? '';
      yield lines.slice(0, -1);
    }
  } finally {
    reader.releaseLock();
  }
}

export async function U8StreamCompare(stream1: ReadableStream<Uint8Array>, stream2: ReadableStream<Uint8Array>): Promise<boolean> {
  const one = new U8StreamReader(stream1.getReader());
  const two = new U8StreamReader(stream2.getReader());
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

const EMPTY_UI8A = new Uint8Array();

export class U8StreamReader {
  done = false;
  i = 0;
  length = 0;
  value: Uint8Array = EMPTY_UI8A;
  constructor(public reader: ReadableStreamDefaultReader<Uint8Array>) {}
  async next(this: U8StreamReader) {
    const { done, value = EMPTY_UI8A } = await this.reader.read();
    if (this.done === done && this.value === value) {
      return { changed: false };
    }
    this.done = done;
    this.i = 0;
    this.length = value.length;
    this.value = value;
    return { changed: true };
  }
  releaseLock() {
    this.reader.releaseLock();
  }
}

export async function U8StreamReadAll(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  try {
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }
    return U8Concat(chunks);
  } finally {
    reader.releaseLock();
  }
}

export async function U8StreamReadSome(stream: ReadableStream<Uint8Array>, count: number): Promise<Uint8Array> {
  if (count < 1) {
    return U8();
  }
  const reader = stream.getReader();
  try {
    const chunks: Uint8Array[] = [];
    let size_read = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      size_read += value.byteLength;
      if (size_read >= count) {
        break;
      }
    }
    return U8Take(U8Concat(chunks), count)[0];
  } finally {
    reader.releaseLock();
  }
}
