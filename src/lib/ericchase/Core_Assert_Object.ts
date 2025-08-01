export function Core_Assert_Object(value: any): value is object {
  if (typeof value !== 'object') {
    throw new Error(`Assertion Failed: typeof value(${value}) should equal object`);
  }
  return true;
}
