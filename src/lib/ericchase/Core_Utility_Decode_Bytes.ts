export function Core_Utility_Decode_Bytes(buffer: Uint8Array): string {
  return new TextDecoder().decode(buffer);
}
