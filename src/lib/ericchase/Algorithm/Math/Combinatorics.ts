// These functions generate combinations and permutations of R items from a
// source array of N items. Use the nCr and nPr functions to quickly count the
// number of combinations or permutations that would be produced.

import { Factorial } from './Factorial.js';

export function nCr(n: number, r: number, repetitions = false): bigint {
  if (repetitions === true) {
    return Factorial(n + r - 1) / (Factorial(r) * Factorial(n - 1));
  }
  return Factorial(n) / (Factorial(r) * Factorial(n - r));
}

export function nPr(n: number, r: number, repetitions = false): bigint {
  if (repetitions === true) {
    return BigInt(n) ** BigInt(r);
  }
  return Factorial(n) / Factorial(n - r);
}

export function* nChooseRCombinations<T>(choices: T[], r: number, repetitions = false): Generator<T[]> {
  const count = nCr(choices.length, r, repetitions);
  if (repetitions === true) {
    const out: T[] = new Array(r).fill(choices[0]);
    const indices: number[] = new Array(r).fill(0);
    for (let c = typeof count === 'bigint' ? 0n : 0; c < count; c++) {
      yield out.slice();
      let i = r - 1;
      for (let j = 0; j < r; j++, i--) {
        indices[i]++;
        if (indices[i] < choices.length /* - j */) {
          out[i] = choices[indices[i]];
          break;
        }
      }
      for (i++; i < r; i++) {
        indices[i] = indices[i - 1] /* + 1 */;
        out[i] = choices[indices[i]];
      }
    }
  } else {
    const out: T[] = choices.slice(0, r);
    const indices = [...out.keys()];
    for (let c = typeof count === 'bigint' ? 0n : 0; c < count; c++) {
      yield out.slice();
      let i = r - 1;
      for (let j = 0; j < r; j++, i--) {
        indices[i]++;
        if (indices[i] < choices.length - j) {
          out[i] = choices[indices[i]];
          break;
        }
      }
      for (i++; i < r; i++) {
        indices[i] = indices[i - 1] + 1;
        out[i] = choices[indices[i]];
      }
    }
  }
}

export function* nChooseRPermutations<T>(choices: T[], r: number, repetitions = false): Generator<T[]> {
  const count = nPr(choices.length, r, repetitions);
  if (repetitions === true) {
    const out: T[] = new Array(r).fill(choices[0]);
    const indices: number[] = new Array(r).fill(0);
    for (let c = typeof count === 'bigint' ? 0n : 0; c < count; c++) {
      yield out.slice();
      let i = r - 1;
      for (let j = 0; j < r; j++, i--) {
        indices[i]++;
        if (indices[i] < choices.length) {
          out[i] = choices[indices[i]];
          break;
        }
        indices[i] = 0;
        out[i] = choices[0];
      }
    }
  } else {
    const out: T[] = choices.slice(0, r);
    const indices: number[] = [...out.keys()];
    const imap: number[] = new Array(choices.length).fill(0);
    for (let i = 0; i < r; i++) {
      imap[i] = 1;
    }
    for (let c = typeof count === 'bigint' ? 0n : 0; c < count; c++) {
      yield out.slice();
      let i = r - 1;
      for (let j = 0; j < r; j++, i--) {
        imap[indices[i]] = 0;
        indices[i]++;
        while (imap[indices[i]] === 1) {
          indices[i]++;
        }
        if (indices[i] < choices.length) {
          imap[indices[i]] = 1;
          out[i] = choices[indices[i]];
          break;
        }
      }
      for (; i < r; i++) {
        if (indices[i] < choices.length) {
          continue;
        }
        indices[i] = 0;
        while (imap[indices[i]] === 1) {
          indices[i]++;
        }
        imap[indices[i]] = 1;
        out[i] = choices[indices[i]];
      }
    }
  }
}
