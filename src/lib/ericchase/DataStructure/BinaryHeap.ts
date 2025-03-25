export interface IBinaryHeap<T> {
  clear(): void;
  get size(): number;
  get top(): T;
  insert(value: T): void;
  mustComeBefore: (a: T, b: T) => boolean;
  pop(): T;
}

export class BinaryHeap<T> implements IBinaryHeap<T> {
  constructor(public mustComeBefore: (a: T, b: T) => boolean = (a: T, b: T) => a < b) {}
  clear(): void {
    this.buffer.length = 0;
  }
  get size(): number {
    return this.buffer.length;
  }
  get top(): T {
    return this.buffer[0];
  }
  insert(value: T): void {
    this.buffer.push(value);
    this.siftUp(this.buffer.length - 1);
  }
  pop(): T {
    const top = this.top;
    if (this.buffer.length > 1) {
      this.buffer[0] = this.buffer[this.buffer.length - 1];
      this.siftDown(0);
    }
    this.buffer.pop();
    return top;
  }
  toArray(): T[] {
    const temp = new BinaryHeap<T>(this.mustComeBefore);
    temp.buffer = this.buffer.slice();
    const items: T[] = [];
    while (temp.size > 0) {
      items.push(temp.pop());
    }
    return items;
  }
  static GetLeftChildIndex(index: number): number {
    return index * 2 + 1;
  }
  static GetParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }
  static GetRightChildIndex(index: number): number {
    return index * 2 + 2;
  }
  static ToArray<T>(heap: BinaryHeap<T>): T[] {
    const temp = new BinaryHeap<T>(heap.mustComeBefore);
    temp.buffer = heap.buffer.slice();
    const items: T[] = [];
    while (temp.size > 0) {
      items.push(temp.pop());
    }
    return items;
  }
  protected siftDown(index: number): void {
    const iL = BinaryHeap.GetLeftChildIndex(index);
    const iR = BinaryHeap.GetRightChildIndex(index);
    let orderedIndex = index;
    if (iL < this.buffer.length && this.mustComeBefore(this.buffer[iL], this.buffer[orderedIndex])) {
      orderedIndex = iL;
    }
    if (iR < this.buffer.length && this.mustComeBefore(this.buffer[iR], this.buffer[orderedIndex])) {
      orderedIndex = iR;
    }
    if (orderedIndex !== index) {
      this.swap(orderedIndex, index);
      this.siftDown(orderedIndex);
    }
  }
  protected siftUp(index: number): void {
    if (index === 0) {
      return;
    }
    const iP = BinaryHeap.GetParentIndex(index);
    if (!this.mustComeBefore(this.buffer[iP], this.buffer[index])) {
      this.swap(iP, index);
      this.siftUp(iP);
    }
  }
  protected swap(index1: number, index2: number): void {
    [this.buffer[index1], this.buffer[index2]] = [this.buffer[index2], this.buffer[index1]];
  }
  protected buffer: T[] = [];
}

export class MaxBinaryHeap<T> extends BinaryHeap<T> implements IBinaryHeap<T> {
  constructor(mustComeBefore: (a: T, b: T) => boolean = (a: T, b: T) => a > b) {
    super(mustComeBefore);
  }
}

export class MinBinaryHeap<T> extends BinaryHeap<T> implements IBinaryHeap<T> {}
