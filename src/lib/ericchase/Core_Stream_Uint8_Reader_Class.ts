import { ARRAY__UINT8__EMPTY } from './Core_Array_Uint8.js';

export type Type_Core_Stream_Uint8_Reader_Class = Class_Core_Stream_Uint8_Reader_Class;

export class Class_Core_Stream_Uint8_Reader_Class {
  done = false;
  i = 0;
  length = 0;
  value: Uint8Array = ARRAY__UINT8__EMPTY;
  constructor(public reader: ReadableStreamDefaultReader<Uint8Array>) {}
  async next(this: Class_Core_Stream_Uint8_Reader_Class): Promise<{ changed: boolean }> {
    const { done, value = ARRAY__UINT8__EMPTY } = await this.reader.read();
    if (this.done === done && this.value === value) {
      return { changed: false };
    }
    this.done = done;
    this.i = 0;
    this.length = value.length;
    this.value = value;
    return { changed: true };
  }
  releaseLock(): void {
    this.reader.releaseLock();
  }
}

export function Core_Stream_Uint8_Reader_Class(reader: ReadableStreamDefaultReader<Uint8Array>): Class_Core_Stream_Uint8_Reader_Class {
  return new Class_Core_Stream_Uint8_Reader_Class(reader);
}
