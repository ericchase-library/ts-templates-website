const MATH__FACTORIAL__CACHE = [BigInt(1), BigInt(1)];

export function Core_Math_Factorial(n: number): bigint {
  if (!(n in MATH__FACTORIAL__CACHE)) {
    let fact = MATH__FACTORIAL__CACHE[MATH__FACTORIAL__CACHE.length - 1];
    for (let i = MATH__FACTORIAL__CACHE.length; i < n; i++) {
      fact *= BigInt(i);
      MATH__FACTORIAL__CACHE[i] = fact;
    }
    MATH__FACTORIAL__CACHE[n] = fact * BigInt(n);
  }
  return MATH__FACTORIAL__CACHE[n];
}
