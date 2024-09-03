/** Utility: One or more. */
export type N<T> = T | T[];

/** May help IDE show clearer type information. */
export type Prettify<T> = {
  [K in keyof T]: T[K];
};
