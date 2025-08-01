export function Core_Array_Uint8_To_Decimal(bytes: Uint8Array): string[] {
  // Array[index] has best overall performance for chrome and firefox
  const decimal: string[] = new Array(bytes.byteLength);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    decimal[i] = (bytes[i] >>> 0).toString(10);
  }
  return decimal;
}
