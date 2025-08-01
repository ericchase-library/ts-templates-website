import { Core_Array_Uint8_Concat } from './Core_Array_Uint8_Concat.js';

export async function Async_Core_Stream_Uint8_Read_All(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
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
    return Core_Array_Uint8_Concat(chunks);
  } finally {
    reader.releaseLock();
  }
}
