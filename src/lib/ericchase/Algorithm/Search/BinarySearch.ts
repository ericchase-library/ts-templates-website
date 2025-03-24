// ? seems to work

import { ArrayEndpoints } from '../Array.js';
import { Midpoint } from '../Math.js';

// Returns index of item that "equals" target; otherwise, -1.
export function BinarySearch<T>(array: T[], target: T, isOrdered: (a: T, b: T) => boolean = (a: T, b: T) => a < b): number {
  let [begin, end] = ArrayEndpoints(array);
  let middle = Midpoint(begin, end);
  while (begin < end) {
    if (isOrdered(target, array[middle])) {
      end = middle;
    } else {
      begin = middle + 1;
    }
    middle = Midpoint(begin, end);
  }
  if (isOrdered(array[middle - 1], target) === false) {
    return middle - 1;
  }
  return -1;
}

// Returns index where target is or would be inserted.
function Insertion<T>(array: T[], target: T, isOrdered: (a: T, b: T) => boolean = (a: T, b: T) => a < b): number {
  let [begin, end] = ArrayEndpoints(array);
  let middle = Midpoint(begin, end);
  while (begin < end) {
    if (isOrdered(target, array[middle])) {
      end = middle;
    } else {
      begin = middle + 1;
    }
    middle = Midpoint(begin, end);
  }
  if (isOrdered(array[middle - 1], target) === false) {
    return middle - 1;
  }
  return middle;
}

BinarySearch.Insertion = Insertion;
