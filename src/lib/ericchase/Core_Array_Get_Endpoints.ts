export function Core_Array_Get_Endpoints(array: ArrayLike<unknown>): [number, number] {
  if (!Array.isArray(array) || array.length < 1) {
    return [-1, -1];
  }
  return [0, array.length];
}
