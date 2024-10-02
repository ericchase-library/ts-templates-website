import node_fs from 'node:fs';
import type { Path, PathGroup } from '../../../src/lib/ericchase/Platform/Node/Path.js';
import { cache_db, CreateAllQuery, CreateGetQuery, CreateRunQuery, QueryError, QueryExistsResult, type QueryResult } from './cache.js';
import { Cache_Lock, Cache_Unlock } from './LockCache.js';

const PATH = 'path';
const MTIMEMS = 'mtimeMs';
const CURRENT_MTIMEMS = 'current_mtimeMs';

class FILESTATS_RECORD {
  [PATH]?: string;
  [MTIMEMS]?: number;
}

const TABLE = 'filestats';

const CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS ${TABLE} (
    ${PATH} TEXT PRIMARY KEY NOT NULL,
    ${MTIMEMS} REAL NOT NULL
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
const isFileModified = CreateGetQuery(QueryExistsResult, IS_FILE_MODIFIED, { [PATH]: '', [CURRENT_MTIMEMS]: 0 });

const DELETE_ALL_RECORDS = /* sql */ `
  DELETE FROM ${TABLE}
`;
const deleteAllRecords = CreateRunQuery(DELETE_ALL_RECORDS);

const UPDATE_FILESTAT_RECORD = /* sql */ `
  INSERT OR REPLACE INTO ${TABLE} (${PATH}, ${MTIMEMS})
  VALUES ($${PATH}, $${MTIMEMS})
`;
const updateFileStatsRecord = CreateRunQuery(UPDATE_FILESTAT_RECORD, { [PATH]: '', [MTIMEMS]: 0 });

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

export function Cache_IsFileModified(path: Path | PathGroup): QueryResult<boolean> {
  try {
    const mtimeMs = node_fs.statSync(path.path).mtimeMs;
    const q0 = isFileModified({ [PATH]: path.path, [CURRENT_MTIMEMS]: mtimeMs });
    updateFileStatsRecord({ [PATH]: path.path, [MTIMEMS]: mtimeMs });
    return { data: q0?.result === 1 };
  } catch (error) {
    return QueryError(error);
  }
}
