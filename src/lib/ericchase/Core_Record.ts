export type Type_Core_Record_Empty = Record<string, never>;
export type Type_Core_Record_Recursive<K extends keyof any, T> = { [P in K]: T | Type_Core_Record_Recursive<K, T> };
