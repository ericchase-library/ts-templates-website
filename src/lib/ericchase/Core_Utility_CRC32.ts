/* Table of CRCs of all 8-bit messages. */
export const UTILITY__CRC32__TABLE = new Uint32Array(256);
const UTILITY__CRC32__MAGIC = new Uint32Array([0xedb88320]);
/* Make the table for a fast CRC. */
for (let i = 0; i < 256; i++) {
  UTILITY__CRC32__TABLE[i] = i;
  for (let k = 0; k < 8; k++) {
    if ((UTILITY__CRC32__TABLE[i] >>> 0) & 1) {
      UTILITY__CRC32__TABLE[i] = UTILITY__CRC32__MAGIC[0] ^ (UTILITY__CRC32__TABLE[i] >>> 1);
    } else {
      UTILITY__CRC32__TABLE[i] >>>= 1;
    }
  }
}

export function Core_Utility_CRC32(bytes: Uint8Array): number {
  const crc = new Uint32Array([0xffffffff]);
  for (let index = 0; index < bytes.length; index++) {
    crc[0] = UTILITY__CRC32__TABLE[(crc[0] ^ bytes[index]) & 0xff] ^ (crc[0] >>> 8);
  }
  return (crc[0] ^ (0xffffffff >>> 0)) >>> 0;
}
