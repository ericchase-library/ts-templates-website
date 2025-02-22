export function* CartesianProduct<A extends readonly unknown[], B extends readonly unknown[]>(array_a: A, array_b: B): Generator<[A[number], B[number]], void, unknown> {
  for (let i = 0; i < array_a.length; i++) {
    for (let j = 0; j < array_b.length; j++) {
      yield [array_a[i], array_b[j]];
    }
  }
}

export function* nCartesianProduct<T extends unknown[][]>(...arrays: T): Generator<{ [K in keyof T]: T[K][number] }> {
  const count = arrays.reduce((product, arr) => product * BigInt(arr.length), 1n);
  const out = arrays.map((arr) => arr[0]) as { [K in keyof T]: T[K][number] };
  const indices: number[] = new Array(arrays.length).fill(0);
  const lengths: number[] = arrays.map((arr) => arr.length);
  for (let c = 0n; c < count; c++) {
    yield out.slice() as { [K in keyof T]: T[K][number] };
    let i = arrays.length - 1;
    for (let j = 0; j < arrays.length; j++, i--) {
      indices[i]++;
      if (indices[i] < lengths[i]) {
        out[i] = arrays[i][indices[i]];
        break;
      }
      indices[i] = 0;
      out[i] = arrays[i][0];
    }
  }
}

// The 2-Combination is what I formerly referred as the SelfCartesianProduct
// nChooseRCombinations([1, 2], 2)]);
