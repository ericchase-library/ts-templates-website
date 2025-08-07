import { Core_Array_Get_Endpoints } from './Core_Array_Get_Endpoints.js';
import { Core_Math_Get_Midpoint } from './Core_Math_Get_Midpoint.js';

export function Core_Array_Binary_Search_Exact_Match<T>(array: T[], target: T, isOrdered: (a: T, b: T) => boolean = (a: T, b: T) => a < b): number {
  /** Returns index of item that "equals" target; otherwise, -1. */
  let [begin, end] = Core_Array_Get_Endpoints(array);
  let middle = Core_Math_Get_Midpoint(begin, end);
  while (begin < end) {
    if (isOrdered(target, array[middle])) {
      end = middle;
    } else {
      begin = middle + 1;
    }
    middle = Core_Math_Get_Midpoint(begin, end);
  }
  if (isOrdered(array[middle - 1], target) === false) {
    return middle - 1;
  }
  return -1;
}
