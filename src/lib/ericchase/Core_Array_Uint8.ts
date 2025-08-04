export const ARRAY__UINT8__BYTE_TO_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export const ARRAY__UINT8__B64_TO_BYTE = new Map([...ARRAY__UINT8__BYTE_TO_B64].map((char, byte) => [char, byte]));
export const ARRAY__UINT8__EMPTY = Uint8Array.from([]);
export const PROMISE__ARRAY__UINT8__EMPTY = Promise.resolve(ARRAY__UINT8__EMPTY);
