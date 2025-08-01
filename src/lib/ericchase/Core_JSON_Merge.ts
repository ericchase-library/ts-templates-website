import { Core_JSON_Analyze, Type_Core_JSON_Array, Type_Core_JSON_Object, Type_Core_JSON_Primitive } from './Core_JSON_Analyze.js';

export type Type_Core_JSON_ParseResult = Type_Core_JSON_Array | Type_Core_JSON_Object | Type_Core_JSON_Primitive;

export function Core_JSON_Merge(...sources: unknown[]): Type_Core_JSON_ParseResult {
  if (sources.length === 0) return null;
  if (sources.length === 1) return Core_JSON_Analyze(sources[0]).source;
  const head = Core_JSON_Analyze(sources[0]);
  for (const source of sources.slice(1)) {
    if (Core_JSON_Analyze(source).type !== head.type) {
      throw TypeError('Cannot merge JSON strings of different types. Every JSON string must be all arrays, all objects, or all primitives.');
    }
  }
  if (head.type === 'array') {
    const result: Type_Core_JSON_Array = [];
    for (const source of sources as Type_Core_JSON_Array[]) {
      result.push(...source);
    }
    return result;
  }
  if (head.type === 'object') {
    function mergeinto(result: Type_Core_JSON_Object, source: Type_Core_JSON_Object) {
      for (const key in source) {
        if (Object.hasOwn(result, key) === false) {
          result[key] = {};
        }
        const { type: r_type } = Core_JSON_Analyze(result[key]);
        const { type: s_type } = Core_JSON_Analyze(source[key]);
        if (r_type === 'object' && s_type === 'object') {
          mergeinto(result[key] as Type_Core_JSON_Object, source[key] as Type_Core_JSON_Object);
        } else if (r_type === 'array' && s_type === 'array') {
          result[key] = [...(result[key] as Type_Core_JSON_Array[]), ...(source[key] as Type_Core_JSON_Array[])];
        } else {
          result[key] = source[key];
        }
      }
      return result;
    }
    const result: Type_Core_JSON_Object = {};
    for (const source of sources as Type_Core_JSON_Object[]) {
      mergeinto(result, source);
    }
    return result;
  }
  return Core_JSON_Analyze(sources[sources.length - 1]).source;
}
