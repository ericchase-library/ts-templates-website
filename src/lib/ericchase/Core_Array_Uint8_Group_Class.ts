export type Type_Core_Array_Uint8_Group_Class = Class_Core_Array_Uint8_Group_Class;

export class Class_Core_Array_Uint8_Group_Class {
  arrays = new Array<Uint8Array>();
  byteLength = 0;
  constructor() {}
  add(bytes: Uint8Array): number {
    this.arrays.push(bytes);
    this.byteLength += bytes.byteLength;
    return this.byteLength;
  }
  /**
   * @param {number} count Number of bytes to extract. If greater than byteLength, unset elements will be 0.
   * @param {number} offset Number of bytes to skip before extracting. If negative, 0 will be used. If greater than byteLength, no bytes will be extracted.
   */
  get(count: number, offset = 0): Uint8Array {
    const out = new Uint8Array(count);
    if (offset < 0) {
      offset = 0;
    }
    let i_out = 0;
    let i_total = 0;
    for (const u8 of this.arrays) {
      for (let i_u8 = 0; i_u8 < u8.length && i_out < out.length; i_u8++, i_total++) {
        if (i_total < offset) {
          continue;
        }
        out[i_out] = u8[i_u8];
        i_out++;
      }
    }
    return out;
  }
}

export function Core_Array_Uint8_Group_Class(): Class_Core_Array_Uint8_Group_Class {
  return new Class_Core_Array_Uint8_Group_Class();
}
