export function* Core_Array_Chunks_Generator<T>(array: T[], count: number): Generator<{ begin: number; end: number; slice: T[] }> {
  if (count > array.length) {
    yield { begin: 0, end: array.length, slice: array.slice() };
  } else if (count > 0) {
    let i = count;
    for (; i < array.length; i += count) {
      yield { begin: i - count, end: i, slice: array.slice(i - count, i) };
    }
    yield { begin: i - count, end: array.length, slice: array.slice(i - count) };
  } else {
    yield { begin: 0, end: 0, slice: [] };
  }
}
