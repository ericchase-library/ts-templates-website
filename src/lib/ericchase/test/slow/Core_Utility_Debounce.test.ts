import { describe, expect, test } from 'bun:test';
import { Core_Utility_Debounce } from '../../Core_Utility_Debounce.js';

describe(Core_Utility_Debounce.name, async () => {
  test('Error.', async () => {
    const fn = Core_Utility_Debounce(() => {
      throw new Error();
    }, 5);
    expect(async () => await fn()).toThrow();
  });
  test('Sync - Consecutive Awaits.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce(() => value++, 5);
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
    await fn();
    expect(value).toBe(3);
    await Bun.sleep(50);
    expect(value).toBe(3);
  });
  test('Sync - Consecutive Calls then Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce(() => value++, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
  });
  test('Sync - Consecutive Calls no Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce(() => value++, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    await Bun.sleep(50);
    expect(value).toBe(1);
  });
  test('Async - Consecutive Awaits.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce(async () => {
      await Bun.sleep(5);
      value++;
    }, 5);
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await fn();
    expect(value).toBe(2);
    await fn();
    expect(value).toBe(3);
    await Bun.sleep(50);
    expect(value).toBe(3);
  });
  test('Async - Consecutive Calls then Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce(async () => {
      await Bun.sleep(5);
      value++;
    }, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    await fn();
    expect(value).toBe(1);
    await Bun.sleep(50);
    expect(value).toBe(1);
  });
  test('Async - Consecutive Calls no Await.', async () => {
    let value = 0;
    const fn = Core_Utility_Debounce(async () => {
      await Bun.sleep(5);
      value++;
    }, 5);
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    fn();
    expect(value).toBe(0);
    await Bun.sleep(50);
    expect(value).toBe(1);
  });
});
