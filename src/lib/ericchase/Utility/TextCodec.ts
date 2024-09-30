const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export function DecodeText(buffer: Uint8Array) {
  return textDecoder.decode(buffer);
}
export function EncodeText(text: string) {
  return textEncoder.encode(text);
}
