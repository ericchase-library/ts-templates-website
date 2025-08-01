export function* Core_Array_Zip_Generator<T extends readonly Iterable<any>[]>(...iterables: T): Generator<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U | undefined : undefined }> {
  let mock_count = 0;
  const mock_iterable: IterableIterator<any> = {
    next() {
      return { value: undefined, done: false };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
  function process_iterators<I extends Iterator<any>[]>(iterators: I): { [K in keyof I]: I[K] extends Iterator<infer U> ? U | undefined : undefined } {
    const values = [] as unknown as { [K in keyof I]: I[K] extends Iterator<infer U> ? U | undefined : undefined };
    for (let index = 0; index < iterators.length; index++) {
      const next = iterators[index].next();
      if ('done' in next && next.done === true) {
        mock_count++;
        iterators[index] = mock_iterable;
        values[index] = undefined;
      } else {
        values[index] = 'value' in next ? next.value : undefined;
      }
    }
    return values;
  }
  const iterators: Iterator<any>[] = [];
  for (const iterable of iterables) {
    try {
      iterators.push(iterable[Symbol.iterator]());
    } catch (error) {
      mock_count++;
      iterators.push(mock_iterable[Symbol.iterator]());
    }
  }
  let values = process_iterators(iterators);
  while (mock_count < iterators.length) {
    yield values as { [K in keyof T]: T[K] extends Iterable<infer U> ? U | undefined : undefined };
    values = process_iterators(iterators);
  }
}
