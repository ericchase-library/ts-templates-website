// MIT License
//
// Copyright (c) 2017 Gustaf Andersson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// https://github.com/gustf/js-levenshtein

function _min(d0: number, d1: number, d2: number, bx: number, ay: number): number {
  return d0 < d1 || d2 < d1 ? (d0 > d2 ? d2 + 1 : d0 + 1) : bx === ay ? d1 : d1 + 1;
}

export function levenshtein_distance(a: string, b: string): number {
  let tmp = a;
  if (a === b) {
    return 0;
  }
  if (a.length > b.length) {
    tmp = a;
    // biome-ignore lint: string are literal
    a = b;
    // biome-ignore lint: string are literal
    b = tmp;
  }
  let la = a.length;
  let lb = b.length;
  while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
    la--;
    lb--;
  }
  let offset = 0;
  while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }
  la -= offset;
  lb -= offset;
  if (la === 0 || lb < 3) {
    return lb;
  }
  let x = 0;
  let y: number;
  let d0: number;
  let d1: number;
  let d2: number;
  let d3: number;
  let dd = 0;
  let dy: number;
  let ay: number;
  let bx0: number;
  let bx1: number;
  let bx2: number;
  let bx3: number;
  const vector: number[] = [];
  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }
  const len = vector.length - 1;
  while (x < lb - 3) {
    bx0 = b.charCodeAt(offset + x);
    bx1 = b.charCodeAt(offset + x + 1);
    bx2 = b.charCodeAt(offset + x + 2);
    bx3 = b.charCodeAt(offset + x + 3);
    d0 = x;
    d1 = x + 1;
    d2 = x + 2;
    d3 = x + 3;
    dd = x += 4;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = _min(dy, d0, d1, bx0, ay);
      d1 = _min(d0, d1, d2, bx1, ay);
      d2 = _min(d1, d2, d3, bx2, ay);
      dd = _min(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }
  while (x < lb) {
    bx0 = b.charCodeAt(offset + x);
    d0 = x;
    dd = ++x;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
      d0 = dy;
    }
  }
  return dd;
}
