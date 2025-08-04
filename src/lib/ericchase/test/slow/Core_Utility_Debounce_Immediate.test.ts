import { describe, expect, test } from 'bun:test';
import { Core_Utility_Debounce_Immediate } from '../../Core_Utility_Debounce_Immediate.js';

describe(Core_Utility_Debounce_Immediate.name, () => {
  test('Error.', async () => {
    const fn = Core_Utility_Debounce_Immediate(() => {
      throw new Error();
    }, 5);
    expect(async () => await fn()).toThrow();
  });
  test('Sync - Consecutive Awaits.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce_Immediate(() => value++, 5);
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
  });
  test('Sync - Consecutive Calls then Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce_Immediate(() => value++, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(1);
    fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
  });
  test('Sync - Consecutive Calls no Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce_Immediate(() => value++, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(1);
    fn();
    expect(value).toBe(1);
    fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
  });
  test('Async - Consecutive Awaits.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce_Immediate(async () => {
      await Bun.sleep(5);
      value++;
    }, 5);
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
  });
  test('Async - Consecutive Calls then Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce_Immediate(async () => {
      await Bun.sleep(5);
      value++;
    }, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0); // not enough time for inner function to complete
    fn();
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
  });
  test('Async - Consecutive Calls no Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce_Immediate(async () => {
      await Bun.sleep(5);
      value++;
    }, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0); // not enough time for inner function to complete
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    await Bun.sleep(50);
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
  });
});
