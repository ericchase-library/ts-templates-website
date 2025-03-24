import { RecursiveRecord } from '../../Utility/Types.js';

export type JSONArray = (JSONArray | JSONObject | JSONPrimitive)[];
export type JSONPrimitive = null | boolean | number | string;
export type JSONObject = RecursiveRecord<string, JSONArray | JSONPrimitive>;
export type JSONParseResult = JSONArray | JSONPrimitive | JSONObject;

/** @param {any} obj - Any value that is ***NOT*** a JSON string. This function does ***not*** call `JSON.parse()`. */
export function JSONAnalyze(obj: unknown): { source: JSONArray; type: 'array' } | { source: JSONObject; type: 'object' } | { source: JSONPrimitive; type: 'primitive' } {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      JSONAnalyze(item);
    }
    return { source: obj as JSONArray, type: 'array' };
  }
  if (obj === null || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return { source: obj as JSONPrimitive, type: 'primitive' };
  }
  if (obj === undefined || typeof obj === 'bigint' || typeof obj === 'symbol' || typeof obj === 'undefined' || typeof obj === 'function') {
    throw TypeError('Invalid');
  }
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      JSONAnalyze((obj as JSONObject)[key]);
    }
  }
  return { source: obj as JSONObject, type: 'object' };
}
