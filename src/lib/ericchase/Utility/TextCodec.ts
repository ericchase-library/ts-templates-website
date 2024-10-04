const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export function DecodeBytes(buffer: Uint8Array) {
  return textDecoder.decode(buffer);
}
export function EncodeText(text: string) {
  return textEncoder.encode(text);
}
