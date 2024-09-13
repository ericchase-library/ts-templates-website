import { U8Concat } from '../Array/Uint8Array.js';

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
