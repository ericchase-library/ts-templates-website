import { Database } from 'bun:sqlite';
import fs from 'node:fs';

import { CreateDirectory } from '../../src/lib/ericchase/Platform/Node/Fs.js';
import { NormalizePath } from '../../src/lib/ericchase/Platform/Node/Path.js';

CreateDirectory(NormalizePath('./tools/cache/'));
const db = new Database(NormalizePath('./tools/cache/mtimeMs.db'), { create: true, strict: true });
db.exec('CREATE TABLE IF NOT EXISTS cache (path TEXT PRIMARY KEY, mtimeMs REAL)');

const query_clear = db.query('DELETE FROM cache');
const query_mtimeMs = db.query('SELECT mtimeMs FROM cache WHERE path = ?');
const query_update = db.query('INSERT OR REPLACE INTO cache (path, mtimeMs) VALUES (?, ?)');

export function CacheClear() {
  query_clear.run();
}

export function CacheIsModified(path: string): boolean {
  const record = query_mtimeMs.get(path);
  const mtimeMs = fs.statSync(path).mtimeMs;
  // @ts-ignore
  const cached_mtimeMs = record?.mtimeMs ?? 0;
  if (mtimeMs > cached_mtimeMs) {
    query_update.run(path, mtimeMs);
    return true;
  }
  return false;
}
