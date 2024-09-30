/** Extracts a Call signature from a type if one exists. Not perfect, but works. */
export type CallSignature<T> = T extends (...args: infer A) => infer R ? (...args: A) => R : never;

export type EmptyObject = Record<string, never>;

/** Utility: One or more. */
export type N<T> = T | T[];

/** May help IDE show clearer type information. */
export type Prettify<T> = {
  [K in keyof T]: T[K];
};

/** Recursive Object */
export type RecursiveRecord<K extends keyof any, T> = {
  [P in K]: T | RecursiveRecord<K, T>;
};

export type SyncAsync<T> = T | Promise<T>;
export type SyncAsyncIterable<T> = Iterable<T> | AsyncIterable<T>;
