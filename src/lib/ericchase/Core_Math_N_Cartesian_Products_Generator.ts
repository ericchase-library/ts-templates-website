export function* Core_Math_N_Cartesian_Products_Generator<T extends unknown[][]>(...arrays: T): Generator<{ [K in keyof T]: T[K][number] }> {
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
