import { Core_Math_Factorial } from './Core_Math_Factorial.js';

export function Core_Math_nCr(n: number, r: number, repetitions = false): bigint {
  if (repetitions === true) {
    return Core_Math_Factorial(n + r - 1) / (Core_Math_Factorial(r) * Core_Math_Factorial(n - 1));
  }
  return Core_Math_Factorial(n) / (Core_Math_Factorial(r) * Core_Math_Factorial(n - r));
}
