export function Core_Array_Uint8_To_Hex(bytes: Uint8Array): string[] {
  // Array[index] has best overall performance for chrome and firefox
  const hex: string[] = new Array(bytes.byteLength);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    hex[i] = (bytes[i] >>> 0).toString(16).padStart(2, '0');
  }
  return hex;
}
