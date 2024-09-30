const factorial_cache = [BigInt(1), BigInt(1)];
export function Factorial(n: number): bigint {
  if (!(n in factorial_cache)) {
    let fact = factorial_cache[factorial_cache.length - 1];
    for (let i = factorial_cache.length; i < n; i++) {
      fact *= BigInt(i);
      factorial_cache[i] = fact;
    }
    factorial_cache[n] = fact * BigInt(n);
  }
  return factorial_cache[n];
}
