export function Core_Array_Uint8_To_String(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
