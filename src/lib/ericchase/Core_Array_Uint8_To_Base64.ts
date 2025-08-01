import { ARRAY__UINT8__BYTE_TO_B64 } from './Core_Array_Uint8.js';

export function Core_Array_Uint8_To_Base64(u8_bytes: Uint8Array): string {
  let b64_out = '';
  let u8_index = 0;
  while (u8_index + 3 <= u8_bytes.length) {
    for (const byte of new Uint8Array([
      ((0b11111100 & u8_bytes[u8_index]) >> 2) | 0, //
      ((0b00000011 & u8_bytes[u8_index]) << 4) | ((0b11110000 & u8_bytes[u8_index + 1]) >> 4),
      /*                         */ ((0b00001111 & u8_bytes[u8_index + 1]) << 2) | ((0b11000000 & u8_bytes[u8_index + 2]) >> 6),
      /*                                                            */ (0b00111111 & u8_bytes[u8_index + 2]) | 0,
    ])) {
      b64_out += ARRAY__UINT8__BYTE_TO_B64[byte];
    }
    u8_index += 3;
  }
  switch (u8_bytes.length - u8_index) {
    case 2:
      for (const byte of new Uint8Array([
        ((0b11111100 & u8_bytes[u8_index]) >> 2) | 0, //
        ((0b00000011 & u8_bytes[u8_index]) << 4) | ((0b11110000 & u8_bytes[u8_index + 1]) >> 4),
        /*                         */ ((0b00001111 & u8_bytes[u8_index + 1]) << 2) | 0,
      ])) {
        b64_out += ARRAY__UINT8__BYTE_TO_B64[byte];
      }
      b64_out += '=';
      break;
    case 1:
      for (const byte of new Uint8Array([
        ((0b11111100 & u8_bytes[u8_index]) >> 2) | 0, //
        ((0b00000011 & u8_bytes[u8_index]) << 4) | 0,
      ])) {
        b64_out += ARRAY__UINT8__BYTE_TO_B64[byte];
      }
      b64_out += '==';
      break;
  }
  return b64_out;
}
