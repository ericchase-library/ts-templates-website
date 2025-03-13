import { U8StreamReadSome } from 'src/lib/ericchase/Algorithm/Stream.js';
import { U8 } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { Compat_Blob } from 'src/lib/ericchase/Web API/Blob.js';

export function ReadSome(blob: Blob, count: number): Promise<Uint8Array> {
  const stream = Compat_Blob(blob).stream();
  return stream ? U8StreamReadSome(stream ?? U8(), count) : Promise.resolve(U8());
}
