import { CPath } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { cache_db, cache_platform, CreateAllQuery, CreateGetQuery, CreateRunQuery, QueryError, QueryExistsResult, QueryResult } from './cache.js';
import { Cache_Lock, Cache_Unlock } from './LockCache.js';
import { default as xxhash } from 'xxhash-wasm';

const { h64Raw } = await xxhash();

const PATH = 'path';
const MTIMEMS = 'mtimeMs';
const CURRENT_MTIMEMS = 'current_mtimeMs';
const HASH = 'xxhash';
const CURRENT_HASH = 'current_xxhash';

class FILESTATS_RECORD {
  [PATH]?: string;
  [MTIMEMS]?: number;
  [HASH]?: string;
}

const TABLE = 'filestats';

const CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS ${TABLE} (
    ${PATH} TEXT PRIMARY KEY NOT NULL,
    ${MTIMEMS} REAL NOT NULL,
    ${HASH} TEXT NOT NULL
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
const isFileHashModified = CreateGetQuery(QueryExistsResult, IS_HASH_MODIFIED, { [PATH]: '', [CURRENT_HASH]: '' });

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
const updateFileStatsRecord = CreateRunQuery(UPDATE_FILESTAT_RECORD, { [PATH]: '', [MTIMEMS]: 0, [HASH]: '' });

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

export async function Cache_IsFileStale(path: CPath): Promise<QueryResult<boolean>> {
  try {
    const q0 = getFileStatsRecord[PATH]({ [PATH]: path.raw });
    if (q0 === undefined || q0[MTIMEMS] !== (await getMTimeMS(path)) || q0[HASH] !== (await getB64Hash(path))) {
      return { data: true };
    }
    return { data: false };
  } catch (error) {
    return QueryError(error);
  }
}

export function Cache_QueryFileStats(path: CPath): QueryResult<FILESTATS_RECORD | undefined> {
  try {
    return { data: getFileStatsRecord[PATH]({ [PATH]: path.raw }), error: undefined };
  } catch (error) {
    return QueryError(error);
  }
}

export async function Cache_UpdateFileStats(path: CPath): Promise<QueryResult<FILESTATS_RECORD | undefined>> {
  try {
    updateFileStatsRecord({ [PATH]: path.raw, [MTIMEMS]: await getMTimeMS(path), [HASH]: await getB64Hash(path) });
    return Cache_QueryFileStats(path);
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

export async function Cache_AreFilesEqual(path0: CPath, path1: CPath): Promise<QueryResult<boolean>> {
  try {
    const q0 = getFileStatsRecord[PATH]({ [PATH]: path0.raw });
    const q1 = getFileStatsRecord[PATH]({ [PATH]: path1.raw });
    if (q0 !== undefined && q1 !== undefined) {
      const current_mtimems0 = await getMTimeMS(path0);
      const current_mtimems1 = await getMTimeMS(path1);
      if (q0[MTIMEMS] === current_mtimems0 && q1[MTIMEMS] === current_mtimems1 && q0[HASH] === q1[HASH]) {
        return { data: true };
      }
      const current_hash0 = await getHash(path0);
      const current_hash1 = await getHash(path1);
      if (current_hash0 === current_hash1) {
        updateFileStatsRecord({ [PATH]: path1.raw, [MTIMEMS]: current_mtimems1, [HASH]: btoa(current_hash1.toString()) });
        updateFileStatsRecord({ [PATH]: path0.raw, [MTIMEMS]: current_mtimems0, [HASH]: btoa(current_hash0.toString()) });
        return { data: true };
      }
    }
    return { data: false };
  } catch (error) {
    return QueryError(error);
  }
}

async function getB64Hash(path: CPath): Promise<string> {
  return btoa((await getHash(path)).toString());
}
export async function getHash(path: CPath): Promise<bigint> {
  return h64Raw(await cache_platform.File.readBytes(path));
}

export async function getMTimeMS(path: CPath): Promise<number> {
  return (await cache_platform.Path.getStats(path)).mtimeMs;
}
