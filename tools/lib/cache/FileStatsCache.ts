import { CPath } from 'src/lib/ericchase/Platform/FilePath.js';
import { cache_db, cache_platform, CreateAllQuery, CreateGetQuery, CreateRunQuery, QueryError, QueryExistsResult, QueryResult } from 'tools/lib/cache/cache.js';
import { Cache_Lock, Cache_Unlock } from 'tools/lib/cache/LockCache.js';

let h64Raw: ((inputBuffer: Uint8Array, seed?: bigint) => bigint) | undefined = undefined;

const PATH = 'path';
const MTIMEMS = 'mtimeMs';
const CURRENT_MTIMEMS = 'current_mtimeMs';
const HASH = 'xxhash';
const CURRENT_HASH = 'current_xxhash';

class FILESTATS_RECORD {
  [PATH]?: string;
  [MTIMEMS]?: number;
  [HASH]?: bigint;
}

const TABLE = 'filestats';

const CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS ${TABLE} (
    ${PATH} TEXT PRIMARY KEY NOT NULL,
    ${MTIMEMS} REAL NOT NULL,
    ${HASH} INTEGER NOT NULL
  )
`;
cache_db.run(CREATE_TABLE);

const GET_ALL_RECORDS = /* sql */ `
  SELECT *
    FROM ${TABLE}
`;
const getAllFileStatsRecords = CreateAllQuery(FILESTATS_RECORD, GET_ALL_RECORDS);

const GET_RECORD = /* sql */ `
  SELECT *
    FROM ${TABLE}
   WHERE ${PATH} = $${PATH}
`;
const getFileStatsRecord = {
  [PATH]: CreateGetQuery(FILESTATS_RECORD, GET_RECORD, { [PATH]: '' }),
};
const getFileStatsRecords = {
  [PATH]: CreateAllQuery(FILESTATS_RECORD, GET_RECORD, { [PATH]: '' }),
};

const IS_CACHE_EMPTY = /* sql */ `
  SELECT NOT EXISTS(
    SELECT 1
      FROM ${TABLE}
  ) AS result;
`;
const isCacheEmpty = CreateGetQuery(QueryExistsResult, IS_CACHE_EMPTY);

const IS_FILE_MODIFIED = /* sql */ `
  SELECT NOT EXISTS(
    SELECT 1
      FROM ${TABLE}
     WHERE ${PATH} = $${PATH}
       AND ${MTIMEMS} = $${CURRENT_MTIMEMS}
  ) AS result;
`;
const isFileTimeModified = CreateGetQuery(QueryExistsResult, IS_FILE_MODIFIED, { [PATH]: '', [CURRENT_MTIMEMS]: 0 });

const IS_HASH_MODIFIED = /* sql */ `
  SELECT NOT EXISTS(
    SELECT 1
      FROM ${TABLE}
     WHERE ${PATH} = $${PATH}
       AND ${HASH} = $${CURRENT_HASH}
  ) AS result;
`;
const isFileHashModified = CreateGetQuery(QueryExistsResult, IS_HASH_MODIFIED, { [PATH]: '', [CURRENT_HASH]: BigInt(0) });

const DELETE_ALL_RECORDS = /* sql */ `
  DELETE FROM ${TABLE}
`;
const deleteAllRecords = CreateRunQuery(DELETE_ALL_RECORDS);

const DELETE_RECORD = /* sql */ `
  DELETE FROM ${TABLE}
   WHERE ${PATH} = $${PATH}
`;
const deleteRecord = CreateRunQuery(DELETE_RECORD, { [PATH]: '' });

const UPDATE_FILESTAT_RECORD = /* sql */ `
  INSERT OR REPLACE INTO ${TABLE} (${PATH}, ${MTIMEMS}, ${HASH})
  VALUES ($${PATH}, $${MTIMEMS}, $${HASH})
`;
const updateFileStatsRecord = CreateRunQuery(UPDATE_FILESTAT_RECORD, { [PATH]: '', [MTIMEMS]: 0, [HASH]: BigInt(0) });

export function Cache_FileStats_Lock(): QueryResult<boolean> {
  return Cache_Lock(TABLE);
}

export function Cache_FileStats_Unlock() {
  Cache_Unlock(TABLE);
}

export function Cache_FileStats_Reset(): QueryResult<boolean> {
  try {
    deleteAllRecords();
    const q0 = isCacheEmpty();
    return { data: q0?.result === 1 };
  } catch (error) {
    return QueryError(error);
  }
}

export function Cache_QueryFileStats(path: CPath): QueryResult<FILESTATS_RECORD | undefined> {
  try {
    const q0 = getFileStatsRecord[PATH]({ [PATH]: path.raw });
    if (q0 === undefined) {
      return { data: undefined };
    }
    return { data: q0 };
  } catch (error) {
    return QueryError(error);
  }
}

export async function Cache_UpdateFileStats(path: CPath): Promise<QueryResult<FILESTATS_RECORD>> {
  try {
    const stats = new FILESTATS_RECORD();
    stats[PATH] = path.raw;
    stats[MTIMEMS] = await getMTimeMS(path);
    const q0 = Cache_QueryFileStats(path);
    if (q0.data !== undefined && q0.data[MTIMEMS] === stats[MTIMEMS]) {
      return q0;
    }
    stats[HASH] = await getHash(path);
    updateFileStatsRecord({ [PATH]: stats[PATH], [MTIMEMS]: stats[MTIMEMS], [HASH]: stats[HASH] });
    return { data: stats };
  } catch (error) {
    return QueryError(error);
  }
}

export function Cache_RemoveFileStats(path: CPath): QueryResult<boolean> {
  try {
    deleteRecord({ path: path.raw });
    return { data: true };
  } catch (error) {
    return QueryError(error);
  }
}

export async function getHash(path: CPath): Promise<bigint> {
  if (h64Raw === undefined) {
    h64Raw = (await (await import('xxhash-wasm')).default()).h64Raw;
  }
  return h64Raw(await cache_platform.File.readBytes(path));
}

export async function getMTimeMS(path: CPath): Promise<number> {
  return (await cache_platform.Path.getStats(path)).mtimeMs;
}
