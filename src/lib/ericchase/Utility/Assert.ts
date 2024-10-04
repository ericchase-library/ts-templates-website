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

export function AssertBigint(value1: any): value1 is bigint {
  if (typeof value1 !== 'bigint') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal bigint`);
  }
  return true;
}
export function AssertBoolean(value1: any): value1 is boolean {
  if (typeof value1 !== 'boolean') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal boolean`);
  }
  return true;
}
export function AssertFunction<T>(value1: any): value1 is T {
  if (typeof value1 !== 'function') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal function`);
  }
  return true;
}
export function AssertNumber(value1: any): value1 is number {
  if (typeof value1 !== 'number') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal number`);
  }
  return true;
}
export function AssertObject(value1: any): value1 is object {
  if (typeof value1 !== 'object') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal object`);
  }
  return true;
}
export function AssertString(value1: any): value1 is string {
  if (typeof value1 !== 'string') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal string`);
  }
  return true;
}
export function AssertSymbol(value1: any): value1 is symbol {
  if (typeof value1 !== 'symbol') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal symbol`);
  }
  return true;
}
export function AssertUndefined(value1: any): value1 is undefined {
  if (typeof value1 !== 'undefined') {
    throw new Error(`Assertion Failed: typeof value1(${value1}) should equal undefined`);
  }
  return true;
}
