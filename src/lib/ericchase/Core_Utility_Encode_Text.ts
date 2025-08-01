export function Core_Utility_Encode_Text(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
