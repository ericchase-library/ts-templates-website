export type Type_Core_Promise_Deferred_Class<T> = Class_Core_Promise_Deferred_Class<T>;

export class Class_Core_Promise_Deferred_Class<T> {
  promise: Promise<T>;
  reject!: (reason?: any) => void;
  resolve!: (value: T | PromiseLike<T>) => void;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    if (this.resolve === undefined || this.reject === undefined) {
      throw new Error(`${Class_Core_Promise_Deferred_Class.name}'s constructor failed to setup promise functions.`);
    }
  }
}

export function Core_Promise_Deferred_Class<T = void>(): Class_Core_Promise_Deferred_Class<T> {
  return new Class_Core_Promise_Deferred_Class<T>();
}
