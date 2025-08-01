import { Core_Array_Uint8_From_Uint32 } from './Core_Array_Uint8_From_Uint32.js';
import { Core_Array_Uint8_To_Hex } from './Core_Array_Uint8_To_Hex.js';

export function Core_Array_Uint32_To_Hex(uint: number): string[] {
  return Core_Array_Uint8_To_Hex(Core_Array_Uint8_From_Uint32(uint));
}
