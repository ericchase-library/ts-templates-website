export interface Defer<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function Defer<T = void>(): Defer<T> {
  let resolve = (value: T | PromiseLike<T>) => {};
  let reject = (reason?: any) => {};
  return {
    promise: new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    }),
    resolve,
    reject,
  };
}
