export function Core_Array_Uint8_Take(bytes: Uint8Array, count: number): [Uint8Array, Uint8Array] {
  if (count > bytes.byteLength) {
    return [bytes.slice(), new Uint8Array()];
  }
  if (count > 0) {
    const chunkA = bytes.slice(0, count);
    const chunkB = bytes.slice(count);
    return [chunkA, chunkB];
  }
  return [new Uint8Array(), bytes.slice()];
}
