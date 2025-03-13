import { CPath } from 'src/lib/ericchase/Platform/FilePath.js';
import { DataSetMarkerManager } from 'src/lib/ericchase/Utility/UpdateMarker.js';
import { cache_db, cache_platform, CreateAllQuery, CreateGetQuery, CreateRunQuery, QueryError, QueryExistsResult, QueryResult } from 'tools/lib/cache/cache.js';
import { Cache_Lock, Cache_Unlock } from 'tools/lib/cache/LockCache.js';

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

const modified_marker_manager = new DataSetMarkerManager<string>();

/** Markers only get updated when Cache_IsFileModified is called. */
export function Cache_GetFileModifiedMarker() {
  return modified_marker_manager.getNewMarker();
}

let h64Raw: ((inputBuffer: Uint8Array, seed?: bigint) => bigint) | undefined = undefined;
export async function Cache_IsFileModified(path: CPath): Promise<QueryResult<boolean>> {
  if (h64Raw === undefined) {
    h64Raw = (await (await import('xxhash-wasm')).default()).h64Raw;
  }
  try {
    const mtimeMs = (await cache_platform.Path.getStats(path)).mtimeMs;
    const q0 = isFileTimeModified({ [PATH]: path.raw, [CURRENT_MTIMEMS]: mtimeMs });
    if (q0?.result === 1) {
      const xxhash = h64Raw(await cache_platform.File.readBytes(path));
      const q1 = isFileHashModified({ [PATH]: path.raw, [CURRENT_HASH]: xxhash });
      updateFileStatsRecord({ [PATH]: path.raw, [MTIMEMS]: mtimeMs, [HASH]: xxhash });
      if (q1?.result === 1) {
        modified_marker_manager.updateMarkers(path.raw);
        return { data: true };
      }
    }
    return { data: false };
  } catch (error) {
    return QueryError(error);
  }
}
