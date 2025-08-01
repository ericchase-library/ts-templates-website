export function* Core_Array_Sliding_Window_Generator<T extends unknown[]>(array: T, count: number): Generator<{ begin: number; end: number; slice: T }> {
  if (count > 0) {
    if (count < array.length) {
      let i = count;
      for (; i < array.length; i++) {
        yield { begin: i - count, end: i, slice: array.slice(i - count, i) as T };
      }
      yield { begin: i - count, end: array.length, slice: array.slice(i - count) as T };
    } else {
      yield { begin: 0, end: array.length, slice: array.slice() as T };
    }
  }
}
