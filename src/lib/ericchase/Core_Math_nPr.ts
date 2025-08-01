import { Core_Math_Factorial } from './Core_Math_Factorial.js';

export function Core_Math_nPr(n: number, r: number, repetitions = false): bigint {
  if (repetitions === true) {
    return BigInt(n) ** BigInt(r);
  }
  return Core_Math_Factorial(n) / Core_Math_Factorial(n - r);
}
