import { Core_String_Split_Lines } from './Core_String_Split_Lines.js';

export async function* Async_Core_Stream_Uint8_Read_Lines_Generator(stream: ReadableStream<Uint8Array>): AsyncGenerator<string[]> {
  const textDecoderStream = new TextDecoderStream();
  const textDecoderReader = textDecoderStream.readable.getReader();
  const textDecoderWriter = textDecoderStream.writable.getWriter();
  const readable: ReadableStream<string> = new ReadableStream({
    // async cancel() {
    //   await textDecoderReader.cancel();
    // },
    async pull(controller: ReadableStreamDefaultController<string>) {
      const { done, value } = await textDecoderReader.read();
      if (done !== true) {
        controller.enqueue(value);
      } else {
        controller.close();
      }
    },
  });
  const writable: WritableStream<Uint8Array> = new WritableStream({
    // async abort() {
    //   await textDecoderWriter.abort();
    // },
    async close() {
      await textDecoderWriter.close();
    },
    async write(chunk) {
      await textDecoderWriter.write(chunk.slice());
    },
  });
  const reader = stream.pipeThrough({ readable, writable }).getReader();
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
      const lines = Core_String_Split_Lines(buffer + value);
      buffer = lines[lines.length - 1] ?? '';
      yield lines.slice(0, -1);
    }
  } finally {
    reader.releaseLock();
  }
}
