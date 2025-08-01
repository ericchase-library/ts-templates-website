import { Type_Core_Record_Recursive } from './Core_Record.js';

export type Type_Core_JSON_Array = (Type_Core_JSON_Array | Type_Core_JSON_Object | Type_Core_JSON_Primitive)[];
export type Type_Core_JSON_Object = Type_Core_Record_Recursive<string, Type_Core_JSON_Array | Type_Core_JSON_Primitive>;
export type Type_Core_JSON_Primitive = null | boolean | number | string;

export function Core_JSON_Analyze(obj: unknown): { source: Type_Core_JSON_Array; type: 'array' } | { source: Type_Core_JSON_Object; type: 'object' } | { source: Type_Core_JSON_Primitive; type: 'primitive' } {
  /** @param {any} obj - Any value that is ***NOT*** a JSON string. This function does ***NOT*** call `JSON.parse()`. */
  if (Array.isArray(obj)) {
    for (const item of obj) {
      Core_JSON_Analyze(item);
    }
    return { source: obj as Type_Core_JSON_Array, type: 'array' };
  }
  if (obj === null || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return { source: obj as Type_Core_JSON_Primitive, type: 'primitive' };
  }
  if (obj === undefined || typeof obj === 'bigint' || typeof obj === 'symbol' || typeof obj === 'undefined' || typeof obj === 'function') {
    throw TypeError('Invalid');
  }
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      Core_JSON_Analyze((obj as Type_Core_JSON_Object)[key]);
    }
  }
  return { source: obj as Type_Core_JSON_Object, type: 'object' };
}
