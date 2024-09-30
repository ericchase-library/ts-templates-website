export function AssertEqual(value1: any, value2: any) {
  if (value1 !== value2) {
    throw new Error(`Assertion Failed: value1(${value1}) should equal value2(${value2})`);
  }
}
export function AssertNotEqual(value1: any, value2: any) {
  if (value1 === value2) {
    throw new Error(`Assertion Failed: value1(${value1}) should not equal value2(${value2})`);
  }
}
