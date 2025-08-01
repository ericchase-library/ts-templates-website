import { ARRAY__UINT8__EMPTY } from './Core_Array_Uint8.js';
import { Core_Array_Uint8_Concat } from './Core_Array_Uint8_Concat.js';
import { Core_Array_Uint8_Take } from './Core_Array_Uint8_Take.js';

export async function Async_Core_Stream_Uint8_Read_Some(stream: ReadableStream<Uint8Array>, count: number): Promise<Uint8Array> {
  if (count < 1) {
    return ARRAY__UINT8__EMPTY;
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
    return Core_Array_Uint8_Take(Core_Array_Uint8_Concat(chunks), count)[0];
  } finally {
    reader.releaseLock();
  }
}
