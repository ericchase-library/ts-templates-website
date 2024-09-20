import { Database } from 'bun:sqlite';
import fs from 'node:fs';

import { CreateDirectory } from '../../src/lib/ericchase/Platform/Node/Fs.js';
import { Path, type PathGroup } from '../../src/lib/ericchase/Platform/Node/Path.js';

CreateDirectory(new Path('./tools/cache/').path);
const db = new Database(new Path('./tools/cache/mtimeMs.db').path, { create: true, strict: true });
db.exec('CREATE TABLE IF NOT EXISTS cache (path TEXT PRIMARY KEY, mtimeMs REAL)');

const query_clear = db.query('DELETE FROM cache');
const query_mtimeMs = db.query('SELECT mtimeMs FROM cache WHERE path = ?');
const query_update = db.query('INSERT OR REPLACE INTO cache (path, mtimeMs) VALUES (?, ?)');

export function CacheClear() {
  query_clear.run();
}

export function CacheIsModified(path: Path | PathGroup): boolean {
  const record = query_mtimeMs.get(path.path);
  const mtimeMs = fs.statSync(path.path).mtimeMs;
  // @ts-ignore
  const cached_mtimeMs = record?.mtimeMs ?? 0;
  if (mtimeMs > cached_mtimeMs) {
    query_update.run(path.path, mtimeMs);
    return true;
  }
  return false;
}
