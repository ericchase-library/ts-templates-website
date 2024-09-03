export type RecursiveRecord<K extends keyof any, T> = {
  [P in K]: T | RecursiveRecord<K, T>;
};
