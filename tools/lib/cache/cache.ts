import { Database } from 'bun:sqlite';
import { CreateDirectory } from '../../../src/lib/ericchase/Platform/Node/Fs.js';
import { Path } from '../../../src/lib/ericchase/Platform/Node/Path.js';

export const cache_dir = new Path('./tools/cache');

CreateDirectory(cache_dir);

export const cache_db = new Database(cache_dir.appendSegment('cache.db').path, { create: true, strict: true });

type SQLQueryBindings = Record<string, string | bigint | NodeJS.TypedArray | number | boolean | null>;
export function CreateGetQuery<ReturnType, Bindings extends SQLQueryBindings>(return_type: new (...args: any[]) => ReturnType, query: string, bindings?: Bindings) {
  const cached_statement = cache_db.query(query).as(return_type);
  return (bindings?: Bindings) => cached_statement.get(bindings ?? {}) ?? undefined;
}
export function CreateAllQuery<ReturnType, Bindings extends SQLQueryBindings>(return_type: new (...args: any[]) => ReturnType, query: string, bindings?: Bindings) {
  const cached_statement = cache_db.query(query).as(return_type);
  return (bindings?: Bindings) => cached_statement.all(bindings ?? {}) ?? undefined;
}

export function CreateRunQuery<Bindings extends SQLQueryBindings>(query: string, bindings?: Bindings) {
  const cached_statement = cache_db.query(query);
  return (bindings?: Bindings) => cached_statement.run(bindings ?? {});
}

export type QueryError = { data?: undefined; error: { message: any; options?: Record<string, any> } };
export function QueryError(message: any, options?: Record<string, any>): QueryError {
  return { error: { message, options } };
}

export type QueryResult<T = void> =
  | (T extends void | null | undefined //
      ? { data?: T; error?: undefined }
      : { data: T; error?: undefined })
  | QueryError;

export class QueryExistsResult {
  result?: 0 | 1;
}
