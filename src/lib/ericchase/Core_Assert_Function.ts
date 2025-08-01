export function Core_Assert_Function<T>(value: any): value is T {
  if (typeof value !== 'function') {
    throw new Error(`Assertion Failed: typeof value(${value}) should equal function`);
  }
  return true;
}
