export function JSONGet<T extends object>(obj: T, key: string): T[keyof T] | undefined {
  return obj[key as keyof T];
}

export function JSONStringifyAll<T extends unknown[]>(...objects: T): string[] {
  return objects.map((obj) => JSON.stringify(obj));
}

export function JSONRawStringParse(str: string): string {
  return JSON.parse(`"${str}"`);
}
