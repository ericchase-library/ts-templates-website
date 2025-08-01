export function Core_Array_Uint8_From_String(from: string): Uint8Array {
  return new TextEncoder().encode(from);
}
