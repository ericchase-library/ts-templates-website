export function* ArrayChunks<T>(array: T[], count: number): Generator<{ begin: number; end: number; slice: T[] }> {
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

export function ArrayEndpoints<T>(array: T[]): [number, number] {
  if (!Array.isArray(array) || array.length < 1) {
    return [-1, -1];
  }
  return [0, array.length];
}

export function ArrayEquals(array: ArrayLike<any>, other: ArrayLike<any>): boolean {
  if (array.length !== other.length) {
    return false;
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== other[i]) {
      return false;
    }
  }
  return true;
}

export function ArrayShuffle<T>(items: T[]) {
  const l = items.length - 1;
  for (let j = 0; j < items.length; j++) {
    let r = Math.floor(Math.random() * l);
    [items[l], items[r]] = [items[r], items[l]];
  }
  return items;
}

export function ArraySplit<T>(array: T[], count: number): T[][] {
  return [...ArrayChunks(array, count)].map((chunk) => chunk.slice);
}

export function* ArrayBufferToBytes(buffer: ArrayBufferLike): Generator<number> {
  const view = new DataView(buffer);
  for (let i = 0; i < view.byteLength; i++) {
    yield view.getUint8(i) >>> 0;
  }
}
