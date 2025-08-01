import { Core_Array_Chunks_Generator } from './Core_Array_Chunks_Generator.js';

export function Core_Array_Split<T>(array: T[], count: number): T[][] {
  return [...Core_Array_Chunks_Generator(array, count)].map((chunk) => chunk.slice);
}
