export function Core_Assert_Symbol(value: any): value is symbol {
  if (typeof value !== 'symbol') {
    throw new Error(`Assertion Failed: typeof value(${value}) should equal symbol`);
  }
  return true;
}
