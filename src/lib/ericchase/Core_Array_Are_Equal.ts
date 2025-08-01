export function Core_Array_Are_Equal(array: ArrayLike<unknown>, other: ArrayLike<unknown>): boolean {
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
