export function Core_Array_Uint8_To_ASCII(bytes: Uint8Array): string {
  // appending to string has best overall performance for chrome and firefox
  let ascii = '';
  for (const byte of bytes) {
    ascii += String.fromCharCode(byte >>> 0);
  }
  return ascii;
}
