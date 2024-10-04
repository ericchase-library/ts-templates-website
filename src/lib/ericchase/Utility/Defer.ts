export function Defer<T = void>() {
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
