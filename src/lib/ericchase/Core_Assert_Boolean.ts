export function Core_Assert_Boolean(value: any): value is boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Assertion Failed: typeof value(${value}) should equal boolean`);
  }
  return true;
}
