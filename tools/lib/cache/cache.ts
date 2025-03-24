import { Database } from 'bun:sqlite';
import { Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { getPlatformProvider } from '../../../src/lib/ericchase/Platform/PlatformProvider.js';

export const cache_dir = Path('./cache');
export const cache_platform = await getPlatformProvider('bun');

await cache_platform.Directory.create(cache_dir);
export const cache_db = new Database(Path(cache_dir, 'cache.db').raw, { create: true, strict: true });

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
