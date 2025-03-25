import { BinaryHeap, IBinaryHeap } from '../DataStructure/BinaryHeap.js';

export class PriorityQueue<T> extends BinaryHeap<T> implements IBinaryHeap<T> {
  constructor(mustComeBefore = (a: T, b: T) => a < b) {
    super((a: T, b: T) => mustComeBefore(a, b) || (!mustComeBefore(b, a) && this.getInsertOrder(a) < this.getInsertOrder(b)));
  }
  insert(value: T): void {
    this.setInsertOrder(value);
    super.insert(value);
  }
  protected getInsertOrder(value: T) {
    return this.insertOrderMap.get(value) ?? 0;
  }
  protected setInsertOrder(value: T) {
    this.insertOrderMap.set(value, this.insertOrderKey);
    this.insertOrderKey++;
  }
  protected insertOrderMap = new Map<T, number>();
  protected insertOrderKey = 0;
}

export class MaxPriorityQueue<T> extends PriorityQueue<T> implements IBinaryHeap<T> {
  constructor(mustComeBefore = (a: T, b: T) => a > b) {
    super(mustComeBefore);
  }
}

export class MinPriorityQueue<T> extends PriorityQueue<T> implements IBinaryHeap<T> {}
