import { UTILITY__CRC32__TABLE } from './Core_Utility_CRC32.js';

export type Type_Core_Utility_CRC32_Class = Class_Core_Utility_CRC32_Class;

export class Class_Core_Utility_CRC32_Class {
  $state = new Uint32Array([0xffffffff]);
  constructor() {}
  update(bytes: Uint8Array): void {
    for (let index = 0; index < bytes.length; index++) {
      this.$state[0] = UTILITY__CRC32__TABLE[(this.$state[0] ^ bytes[index]) & 0xff] ^ (this.$state[0] >>> 8);
    }
  }
  get value(): number {
    return (this.$state[0] ^ (0xffffffff >>> 0)) >>> 0;
  }
}

export function Core_Utility_CRC32_Class(): Class_Core_Utility_CRC32_Class {
  return new Class_Core_Utility_CRC32_Class();
}
