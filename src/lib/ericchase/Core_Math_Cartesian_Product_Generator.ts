export function* Core_Math_Cartesian_Product_Generator<A extends readonly unknown[], B extends readonly unknown[]>(array_a: A, array_b: B): Generator<[A[number], B[number]], void, unknown> {
  // The 2-Combination is what I formerly referred to as the SelfCartesianProduct
  // `ChooseRCombinations([1, 2], 2)]);`
  for (let i = 0; i < array_a.length; i++) {
    for (let j = 0; j < array_b.length; j++) {
      yield [array_a[i], array_b[j]];
    }
  }
}
