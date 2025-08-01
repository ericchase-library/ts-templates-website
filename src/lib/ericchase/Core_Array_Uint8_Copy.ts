export function Core_Array_Uint8_Copy(bytes: Uint8Array, count: number, offset = 0): Uint8Array {
  return bytes.slice(offset, offset + count);
}
