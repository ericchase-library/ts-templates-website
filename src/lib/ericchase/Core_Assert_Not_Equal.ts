export function Core_Assert_Not_Equal(value1: any, value2: any): true {
  if (value1 === value2) {
    throw new Error(`Assertion Failed: value1(${value1}) should NOT equal value2(${value2})`);
  }
  return true;
}
