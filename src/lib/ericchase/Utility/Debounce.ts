import { Defer } from './Defer.js';
import type { SyncAsync } from './Types.js';

/** debounced functions return nothing when called; by design */
export function Debounce<T extends (...args: any[]) => SyncAsync<any>>(fn: T, delay_ms: number) {
  let deferred = Defer();
  let timeout: ReturnType<typeof setTimeout>;
  return async (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        await fn(...args);
        deferred.resolve();
      } catch (error) {
        deferred.reject(error);
      }
      deferred = Defer();
    }, delay_ms);
    return deferred.promise;
  };
}

/** debounced functions return nothing when called; by design */
export function ImmediateDebounce<T extends (...args: any[]) => SyncAsync<any>>(fn: T, delay_ms: number) {
  let deferred = Defer();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout === undefined) {
      (async () => {
        try {
          await fn(...args);
          deferred.resolve();
        } catch (error) {
          deferred.reject(error);
        }
      })();
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      deferred = Defer();
    }, delay_ms);
    return deferred.promise;
  };
}

export const LeadingEdgeDebounce = ImmediateDebounce;
