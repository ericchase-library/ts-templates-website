import { Core_Promise_Deferred_Class } from './Core_Promise_Deferred_Class.js';
import { Core_Promise_Orphan } from './Core_Promise_Orphan.js';

export function Core_Utility_Debounce<T extends (...args: any[]) => Promise<any> | any>(fn: T, delay_ms: number): (...args: Parameters<T>) => Promise<void> {
  let deferred = Core_Promise_Deferred_Class();
  let timeout: Parameters<typeof clearTimeout>[0] = undefined;
  async function async_callback(...args: Parameters<T>) {
    try {
      await fn(...args);
      deferred.resolve();
    } catch (error) {
      deferred.reject(error);
    } finally {
      deferred = Core_Promise_Deferred_Class();
    }
  }
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      Core_Promise_Orphan(async_callback(...args));
    }, delay_ms);
    return deferred.promise;
  };
}

/** debounced functions return nothing when called; by design */
