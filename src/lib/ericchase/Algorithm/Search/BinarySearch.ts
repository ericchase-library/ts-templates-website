import { ArrayEndpoints } from '../Array.js';
import { Midpoint } from '../Math.js';

// ? seems to work

export function BinarySearch<T>(array: T[], target: T, isOrdered: (a: T, b: T) => boolean = (a: T, b: T) => a < b): number {
  let [begin, end] = ArrayEndpoints(array);
  let middle = Midpoint(begin, end);
  while (begin < end) {
    if (isOrdered(target, array[middle])) {
      end = middle;
    } else {
      if (!isOrdered(array[middle], target)) {
        break;
      }
      begin = middle + 1;
    }
    middle = Midpoint(begin, end);
  }
  return middle;
}

// dunno what these are anymore
function Lower<T>(array: T[], target: T, isOrdered: (a: T, b: T) => boolean = (a: T, b: T) => a < b): number {
  return BinarySearch.Upper(array, target, (a: T, b: T) => isOrdered(a, b) || !isOrdered(b, a)) + 1;
}
function Upper<T>(array: T[], target: T, isOrdered: (a: T, b: T) => boolean = (a: T, b: T) => a < b): number {
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
  return middle - 1;
}

// there's an issue with Bun's Transpiler with generic arrow functions <T>()=>{}
BinarySearch.Lower = Lower;
BinarySearch.Upper = Upper;
