import { Core_Promise_Deferred_Class } from './Core_Promise_Deferred_Class.js';
import { Core_Promise_Orphan } from './Core_Promise_Orphan.js';

export function Core_Utility_Debounce_Immediate<T extends (...args: any[]) => Promise<any> | any>(fn: T, delay_ms: number): (...args: Parameters<T>) => Promise<void> {
  let deferred = Core_Promise_Deferred_Class();
  let timeout: Parameters<typeof clearTimeout>[0] = undefined;
  async function async_callback(...args: Parameters<T>) {
    try {
      await fn(...args);
      deferred.resolve();
    } catch (error) {
      deferred.reject(error);
    }
  }
  return (...args: Parameters<T>) => {
    if (timeout === undefined) {
      Core_Promise_Orphan(async_callback(...args));
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      deferred = Core_Promise_Deferred_Class();
      timeout = undefined;
    }, delay_ms);
    return deferred.promise;
  };
}

/** aka leading edge debounce */
/** debounced functions return nothing when called; by design */
