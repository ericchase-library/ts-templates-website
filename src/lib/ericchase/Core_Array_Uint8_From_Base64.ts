import { ARRAY__UINT8__B64_TO_BYTE } from './Core_Array_Uint8.js';

export function Core_Array_Uint8_From_Base64(b64_str: string): Uint8Array {
  if (b64_str.length % 4 === 0) {
    const b64_padding = (b64_str[b64_str.length - 1] === '=' ? 1 : 0) + (b64_str[b64_str.length - 2] === '=' ? 1 : 0);
    const b64_bytes = new Uint8Array(b64_str.length - b64_padding);
    for (let i = 0; i < b64_bytes.byteLength; ++i) {
      b64_bytes[i] = ARRAY__UINT8__B64_TO_BYTE.get(b64_str[i]) ?? 0;
    }
    const u8_out = new Uint8Array((b64_str.length / 4) * 3 - b64_padding);
    let u8_offset = 0;
    let b64_index = 0;
    while (b64_index + 4 <= b64_bytes.length) {
      for (const byte of new Uint8Array([
        ((0b00111111 & b64_bytes[b64_index]) << 2) | ((0b00110000 & b64_bytes[b64_index + 1]) >> 4), //
        /*                                        */ ((0b00001111 & b64_bytes[b64_index + 1]) << 4) | ((0b00111100 & b64_bytes[b64_index + 2]) >> 2),
        /*                                                                                         */ ((0b00000011 & b64_bytes[b64_index + 2]) << 6) | (0b00111111 & b64_bytes[b64_index + 3]),
      ])) {
        u8_out[u8_offset] = byte;
        ++u8_offset;
      }
      b64_index += 4;
    }
    switch (u8_out.length - u8_offset) {
      case 2:
        for (const byte of new Uint8Array([
          ((0b00111111 & b64_bytes[b64_index]) << 2) | ((0b00110000 & b64_bytes[b64_index + 1]) >> 4), //
          /*                                        */ ((0b00001111 & b64_bytes[b64_index + 1]) << 4) | ((0b00111100 & b64_bytes[b64_index + 2]) >> 2),
        ])) {
          u8_out[u8_offset] = byte;
          ++u8_offset;
        }
        break;
      case 1:
        for (const byte of new Uint8Array([
          ((0b00111111 & b64_bytes[b64_index]) << 2) | ((0b00110000 & b64_bytes[b64_index + 1]) >> 4), //
        ])) {
          u8_out[u8_offset] = byte;
          ++u8_offset;
        }
        break;
    }
    return u8_out;
  }
  return Uint8Array.from([]);
}
