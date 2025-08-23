import { Database } from 'bun:sqlite';
import { Async_BunPlatform_File_Read_Bytes } from '../../src/lib/ericchase/BunPlatform_File_Read_Bytes.js';
import { BunPlatform_Glob_Match } from '../../src/lib/ericchase/BunPlatform_Glob_Match.js';
import { Core_Console_Error } from '../../src/lib/ericchase/Core_Console_Error.js';
import { Core_Promise_Orphan } from '../../src/lib/ericchase/Core_Promise_Orphan.js';
import { NODE_PATH } from '../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../src/lib/ericchase/NodePlatform_Directory_Create.js';
import { Async_NodePlatform_Path_Get_Stats } from '../../src/lib/ericchase/NodePlatform_Path_Get_Stats.js';

// constants

export const cachepath = NODE_PATH.join('cache');
if ((await Async_NodePlatform_Directory_Create(cachepath, true)).value !== true) {
  throw 'Could not create cache database path.';
}
export const cachedb = new Database(NODE_PATH.join(cachepath, 'cache.db'), { create: true, strict: true });

// types

type SQLQueryBindings = Record<string, string | bigint | NodeJS.TypedArray | number | boolean | null>;
type SQLQueryError = { data?: undefined; error: { message: any; options?: Record<string, any> } };
type SQLQueryResult<T = void> = (T extends void | null | undefined ? { data?: T; error?: undefined } : { data: T; error?: undefined }) | SQLQueryError;

// classes

class TaskRepeater<ReturnType> {
  $result?: Promise<ReturnType> | ReturnType;
  $running = false;
  readonly $executor: () => Promise<void> | void;
  constructor(task: () => Promise<ReturnType> | ReturnType, interval_ms: number, keep_script_running_while_repeater_is_running = true) {
    if (keep_script_running_while_repeater_is_running) {
      this.$executor = async () => {
        if (this.$running === true) {
          this.$result = await task();
          setTimeout(this.$executor, interval_ms).ref();
        }
      };
    } else {
      this.$executor = async () => {
        if (this.$running === true) {
          this.$result = await task();
          setTimeout(this.$executor, interval_ms).unref();
        }
      };
    }
  }
  get result() {
    return this.$result;
  }
  start() {
    if (this.$running === false) {
      this.$running = true;
      Core_Promise_Orphan(this.$executor());
    }
  }
  stop() {
    this.$running = false;
  }
}
class QueryExistsResult {
  result?: 0 | 1;
}

class CACHELOCK_ID {
  static TAG = 'tag';
  static PID = 'pid';
  static LAST_ACCESS_TIME = 'last_access_time';
}
class CACHELOCK_RECORD {
  [CACHELOCK_ID.TAG]?: string;
  [CACHELOCK_ID.PID]?: number;
  [CACHELOCK_ID.LAST_ACCESS_TIME]?: number;
}
class CACHELOCK_DB {
  static TABLE = 'lock';
  static CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS ${CACHELOCK_DB.TABLE} (
    ${CACHELOCK_ID.TAG} TEXT PRIMARY KEY NOT NULL,
    ${CACHELOCK_ID.PID} INTEGER NOT NULL,
    ${CACHELOCK_ID.LAST_ACCESS_TIME} INTEGER NOT NULL
  )
`;
  static {
    cachedb.run(CACHELOCK_DB.CREATE_TABLE);
  }
  ////
  static GET_ALL_RECORDS = /* sql */ `
  SELECT *
    FROM ${CACHELOCK_DB.TABLE}
`;
  static GetAllRecords = CreateAllQuery(CACHELOCK_RECORD, CACHELOCK_DB.GET_ALL_RECORDS);
  ////
  static GET_RECORD = /* sql */ `
  SELECT *
    FROM ${CACHELOCK_DB.TABLE}
   WHERE ${CACHELOCK_ID.TAG} = $${CACHELOCK_ID.TAG}
`;
  static GetRecord = {
    [CACHELOCK_ID.TAG]: CreateGetQuery(CACHELOCK_RECORD, CACHELOCK_DB.GET_RECORD, { [CACHELOCK_ID.TAG]: '' }),
  };
  static GetRecords = {
    [CACHELOCK_ID.TAG]: CreateAllQuery(CACHELOCK_RECORD, CACHELOCK_DB.GET_RECORD, { [CACHELOCK_ID.TAG]: '' }),
  };
  ////
  static INSERT_LOCK = /* sql */ `
  INSERT INTO ${CACHELOCK_DB.TABLE} (${CACHELOCK_ID.TAG}, ${CACHELOCK_ID.PID}, ${CACHELOCK_ID.LAST_ACCESS_TIME})
  VALUES ($${CACHELOCK_ID.TAG}, $${CACHELOCK_ID.PID}, strftime('%s', 'now'))
`;
  static InsertLock = CreateRunQuery(CACHELOCK_DB.INSERT_LOCK, { [CACHELOCK_ID.TAG]: '', [CACHELOCK_ID.PID]: 0 });
  ////
  static IS_LOCK_ACTIVE = /* sql */ `
  SELECT EXISTS(
    SELECT 1
      FROM ${CACHELOCK_DB.TABLE}
     WHERE ${CACHELOCK_ID.TAG} = $${CACHELOCK_ID.TAG}
       AND ${CACHELOCK_ID.LAST_ACCESS_TIME} > strftime('%s', 'now', '-3 seconds')
  ) AS result;
`;
  static IsLockActive = CreateGetQuery(QueryExistsResult, CACHELOCK_DB.IS_LOCK_ACTIVE, { [CACHELOCK_ID.TAG]: '' });
  ////
  static DELETE_ALL_RECORDS = /* sql */ `
  DELETE FROM ${CACHELOCK_DB.TABLE}
   WHERE ${CACHELOCK_ID.PID} = $${CACHELOCK_ID.PID}
`;
  static DeleteAllRecords = CreateRunQuery(CACHELOCK_DB.DELETE_ALL_RECORDS, { [CACHELOCK_ID.PID]: 0 });
  ////
  static DELETE_RECORD = /* sql */ `
  DELETE FROM ${CACHELOCK_DB.TABLE}
   WHERE ${CACHELOCK_ID.TAG} = $${CACHELOCK_ID.TAG}
     AND ${CACHELOCK_ID.PID} = $${CACHELOCK_ID.PID}
`;
  static DeleteRecord = CreateRunQuery(CACHELOCK_DB.DELETE_RECORD, { [CACHELOCK_ID.TAG]: '', [CACHELOCK_ID.PID]: 0 });

  static DELETE_RECORD_BY_FORCE = /* sql */ `
  DELETE FROM ${CACHELOCK_DB.TABLE}
   WHERE ${CACHELOCK_ID.TAG} = $${CACHELOCK_ID.TAG}
`;
  static DeleteRecordByForce = CreateRunQuery(CACHELOCK_DB.DELETE_RECORD_BY_FORCE, { [CACHELOCK_ID.TAG]: '' });
  ////
  static UPDATE_RECORD = /* sql */ `
  UPDATE ${CACHELOCK_DB.TABLE}
     SET ${CACHELOCK_ID.LAST_ACCESS_TIME} = strftime('%s', 'now')
   WHERE ${CACHELOCK_ID.PID} = $${CACHELOCK_ID.PID}
`;
  static UpdateRecord = CreateRunQuery(CACHELOCK_DB.UPDATE_RECORD, { [CACHELOCK_ID.PID]: 0 });
  ////
  static Updater = {
    locks: new Set<string>(),
    updater: new TaskRepeater(
      () => {
        try {
          CACHELOCK_DB.UpdateRecord({ [CACHELOCK_ID.PID]: process.pid });
        } catch (error) {}
      },
      2000,
      false,
    ),
    add(tag: string) {
      CACHELOCK_DB.Updater.locks.add(tag);
      CACHELOCK_DB.Updater.updater.start();
    },
    remove(tag: string) {
      CACHELOCK_DB.Updater.locks.delete(tag);
      if (CACHELOCK_DB.Updater.locks.size < 1) {
        CACHELOCK_DB.Updater.updater.stop();
      }
    },
    removeAll() {
      CACHELOCK_DB.Updater.updater.stop();
      CACHELOCK_DB.Updater.locks.clear();
    },
  };
}
export class CACHELOCK {
  static IsLocked(tag: string): SQLQueryResult<boolean> {
    try {
      return { data: CACHELOCK_DB.IsLockActive({ tag })?.result === 1 };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static Lock(tag: string): SQLQueryResult<boolean> {
    try {
      const r0 = CACHELOCK.LockStatus(tag);
      if (r0.error) return r0;
      if (r0.data.mine) {
        CACHELOCK_DB.Updater.add(tag);
        return { data: true };
      }
      if (r0.data.locked) {
        return { data: false };
      }
      CACHELOCK_DB.DeleteRecordByForce({ tag });
      CACHELOCK_DB.InsertLock({ tag, pid: process.pid });
      const r1 = CACHELOCK.LockStatus(tag);
      if (r1.error) return r1;
      if (r1.data.mine) {
        CACHELOCK_DB.Updater.add(tag);
        return { data: true };
      }
      return { data: false };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static LockEach(tags: string[]):
    | { success: true; tag?: undefined; error?: undefined } //
    | { success: false; tag: string; error?: any } {
    for (const tag of tags) {
      try {
        const r0 = CACHELOCK.Lock(tag);
        if (r0.error || r0.data === false) {
          CACHELOCK.UnlockEach(tags);
          return { success: false, tag, error: r0.error };
        }
      } catch (error) {
        CACHELOCK.UnlockEach(tags);
        return { success: false, tag, error };
      }
    }
    return { success: true };
  }
  static LockOrExit(tag: string, on_exit?: (error?: unknown) => void): void {
    try {
      const r0 = CACHELOCK.Lock(tag);
      if (r0.error || r0.data === false) {
        on_exit?.(r0.error);
        process.exit();
      }
    } catch (error) {
      on_exit?.(error);
      process.exit();
    }
  }
  static LockEachOrExit(tags: string[], on_exit?: (tag: string, error?: unknown) => void): void {
    const r0 = CACHELOCK.LockEach(tags);
    if (r0.success === false) {
      on_exit?.(r0.tag, r0.error);
      process.exit();
    }
  }
  static LockStatus(tag: string): SQLQueryResult<{ locked: boolean; mine: boolean }> {
    try {
      const q0 = CACHELOCK_DB.GetRecord[CACHELOCK_ID.TAG]({ [CACHELOCK_ID.TAG]: tag });
      if (q0) {
        const mine = q0.pid === process.pid;
        return { data: { locked: CACHELOCK_DB.IsLockActive({ tag })?.result === 1, mine } };
      }
      return { data: { locked: false, mine: false } };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static TryLock(script: string) {
    CACHELOCK.LockOrExit(script, (error) => {
      Core_Console_Error(`Another process is locking ${script}. Please wait for that process to end.`, error ?? '');
    });
  }
  static TryLockEach(scripts: string[]) {
    CACHELOCK.LockEachOrExit(scripts, (script, error) => {
      Core_Console_Error(`Another process is locking ${script}. Please wait for that process to end.`, error ?? '');
    });
  }
  static Unlock(tag: string): void {
    CACHELOCK_DB.Updater.remove(tag);
    CACHELOCK_DB.DeleteRecord({ tag, pid: process.pid });
  }
  static UnlockAll(): void {
    CACHELOCK_DB.Updater.removeAll();
    CACHELOCK_DB.DeleteAllRecords({ [CACHELOCK_ID.PID]: process.pid });
  }
  static UnlockEach(tags: string[]): void {
    for (const tag of tags) {
      CACHELOCK.Unlock(tag);
    }
  }
}

class FILESTATS_ID {
  static PATH = 'path';
  static MTIMEMS = 'mtimeMs';
  static CURRENT_MTIMEMS = 'current_mtimeMs';
  static HASH = 'xxhash';
  static CURRENT_HASH = 'current_xxhash';
}
class FILESTATS_RECORD {
  [FILESTATS_ID.PATH]?: string;
  [FILESTATS_ID.MTIMEMS]?: number;
  [FILESTATS_ID.HASH]?: string;
}
class FILESTATS_DB {
  static TABLE = 'filestats';
  static CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS ${FILESTATS_DB.TABLE} (
    ${FILESTATS_ID.PATH} TEXT PRIMARY KEY NOT NULL,
    ${FILESTATS_ID.MTIMEMS} REAL NOT NULL,
    ${FILESTATS_ID.HASH} TEXT NOT NULL
  )
`;
  static {
    cachedb.run(FILESTATS_DB.CREATE_TABLE);
  }
  ////
  static GET_ALL_RECORDS = /* sql */ `
  SELECT *
    FROM ${FILESTATS_DB.TABLE}
`;
  static GetAllRecords = CreateAllQuery(FILESTATS_RECORD, FILESTATS_DB.GET_ALL_RECORDS);
  ////
  static GET_RECORD = /* sql */ `
  SELECT *
    FROM ${FILESTATS_DB.TABLE}
   WHERE ${FILESTATS_ID.PATH} = $${FILESTATS_ID.PATH}
`;
  ////
  static GET_RECORDS_LIKE = /* sql */ `
  SELECT *
    FROM ${FILESTATS_DB.TABLE}
   WHERE ${FILESTATS_ID.PATH} LIKE $${FILESTATS_ID.PATH}
`;
  static GetRecord = {
    [FILESTATS_ID.PATH]: CreateGetQuery(FILESTATS_RECORD, FILESTATS_DB.GET_RECORD, { [FILESTATS_ID.PATH]: '' }),
  };
  static GetRecords = {
    [FILESTATS_ID.PATH]: CreateAllQuery(FILESTATS_RECORD, FILESTATS_DB.GET_RECORD, { [FILESTATS_ID.PATH]: '' }),
  };
  static GetRecordsLike = {
    [FILESTATS_ID.PATH]: CreateAllQuery(FILESTATS_RECORD, FILESTATS_DB.GET_RECORDS_LIKE, { [FILESTATS_ID.PATH]: '' }),
  };
  ////
  static IS_EMPTY = /* sql */ `
  SELECT NOT EXISTS(
    SELECT 1
      FROM ${FILESTATS_DB.TABLE}
  ) AS result;
`;
  static IsEmpty = CreateGetQuery(QueryExistsResult, FILESTATS_DB.IS_EMPTY);
  ////
  static IS_FILE_MODIFIED = /* sql */ `
  SELECT NOT EXISTS(
    SELECT 1
      FROM ${FILESTATS_DB.TABLE}
     WHERE ${FILESTATS_ID.PATH} = $${FILESTATS_ID.PATH}
       AND ${FILESTATS_ID.MTIMEMS} = $${FILESTATS_ID.CURRENT_MTIMEMS}
  ) AS result;
`;
  static IsFileTimeModified = CreateGetQuery(QueryExistsResult, FILESTATS_DB.IS_FILE_MODIFIED, { [FILESTATS_ID.PATH]: '', [FILESTATS_ID.CURRENT_MTIMEMS]: 0 });
  ////
  static IS_HASH_MODIFIED = /* sql */ `
  SELECT NOT EXISTS(
    SELECT 1
      FROM ${FILESTATS_DB.TABLE}
     WHERE ${FILESTATS_ID.PATH} = $${FILESTATS_ID.PATH}
       AND ${FILESTATS_ID.HASH} = $${FILESTATS_ID.CURRENT_HASH}
  ) AS result;
`;
  static IsFileHashModified = CreateGetQuery(QueryExistsResult, FILESTATS_DB.IS_HASH_MODIFIED, { [FILESTATS_ID.PATH]: '', [FILESTATS_ID.CURRENT_HASH]: '' });
  ////
  static DELETE_ALL_RECORDS = /* sql */ `
  DELETE FROM ${FILESTATS_DB.TABLE}
`;
  static DeleteAllRecords = CreateRunQuery(FILESTATS_DB.DELETE_ALL_RECORDS);
  ////
  static DELETE_RECORD = /* sql */ `
  DELETE FROM ${FILESTATS_DB.TABLE}
   WHERE ${FILESTATS_ID.PATH} = $${FILESTATS_ID.PATH}
`;
  static DeleteRecord = CreateRunQuery(FILESTATS_DB.DELETE_RECORD, { [FILESTATS_ID.PATH]: '' });
  ////
  static UPDATE_RECORD = /* sql */ `
  INSERT OR REPLACE INTO ${FILESTATS_DB.TABLE} (${FILESTATS_ID.PATH}, ${FILESTATS_ID.MTIMEMS}, ${FILESTATS_ID.HASH})
  VALUES ($${FILESTATS_ID.PATH}, $${FILESTATS_ID.MTIMEMS}, $${FILESTATS_ID.HASH})
`;
  static UpdateRecord = CreateRunQuery(FILESTATS_DB.UPDATE_RECORD, { [FILESTATS_ID.PATH]: '', [FILESTATS_ID.MTIMEMS]: 0, [FILESTATS_ID.HASH]: '' });
}
export class FILESTATS {
  static LockTable(): SQLQueryResult<boolean> {
    return CACHELOCK.Lock(FILESTATS_DB.TABLE);
  }
  static UnlockTable() {
    CACHELOCK.Unlock(FILESTATS_DB.TABLE);
  }
  static QueryStats(path: string): SQLQueryResult<FILESTATS_RECORD | undefined> {
    try {
      path = NODE_PATH.join(path);
      return { data: FILESTATS_DB.GetRecord[FILESTATS_ID.PATH]({ [FILESTATS_ID.PATH]: path }), error: undefined };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static QueryStatsLike(path_startswith: string): SQLQueryResult<FILESTATS_RECORD[] | undefined> {
    try {
      path_startswith = NODE_PATH.join(path_startswith);
      return { data: FILESTATS_DB.GetRecordsLike[FILESTATS_ID.PATH]({ [FILESTATS_ID.PATH]: path_startswith + '%' }), error: undefined };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static async UpdateStats(path: string): Promise<SQLQueryResult<FILESTATS_RECORD | undefined>> {
    try {
      path = NODE_PATH.join(path);
      FILESTATS_DB.UpdateRecord({ [FILESTATS_ID.PATH]: path, [FILESTATS_ID.MTIMEMS]: await FILESTATS.GetMTimeMS(path), [FILESTATS_ID.HASH]: await FILESTATS.GetB64Hash(path) });
      return FILESTATS.QueryStats(path);
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static async UpdateRecordIfModified(record: FILESTATS_RECORD): Promise<SQLQueryResult<boolean>> {
    try {
      const path = record[FILESTATS_ID.PATH] as string;
      const record_mtimems = record[FILESTATS_ID.MTIMEMS] as number;
      const record_hash = record[FILESTATS_ID.HASH] as string;
      const real_mtimems = await FILESTATS.GetMTimeMS(path);
      if (real_mtimems !== record_mtimems) {
        FILESTATS_DB.UpdateRecord({ [FILESTATS_ID.PATH]: path, [FILESTATS_ID.MTIMEMS]: real_mtimems, [FILESTATS_ID.HASH]: await FILESTATS.GetB64Hash(path) });
        return { data: true, error: undefined };
      } else {
        const real_hash = await FILESTATS.GetB64Hash(path);
        if (real_hash !== record_hash) {
          FILESTATS_DB.UpdateRecord({ [FILESTATS_ID.PATH]: path, [FILESTATS_ID.MTIMEMS]: real_mtimems, [FILESTATS_ID.HASH]: real_hash });
          return { data: true, error: undefined };
        }
      }
      return { data: false, error: undefined };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static RemoveStats(path: string): SQLQueryResult<boolean> {
    try {
      path = NODE_PATH.join(path);
      FILESTATS_DB.DeleteRecord({ path: path });
      return { data: true };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static RemoveAllStats(): SQLQueryResult<boolean> {
    try {
      FILESTATS_DB.DeleteAllRecords();
      const q0 = FILESTATS_DB.IsEmpty();
      return { data: q0?.result === 1 };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static async PathIsStale(path: string): Promise<SQLQueryResult<boolean>> {
    try {
      path = NODE_PATH.join(path);
      const q0 = FILESTATS_DB.GetRecord[FILESTATS_ID.PATH]({ [FILESTATS_ID.PATH]: path });
      if (q0 === undefined || q0[FILESTATS_ID.MTIMEMS] !== (await FILESTATS.GetMTimeMS(path)) || q0[FILESTATS_ID.HASH] !== (await FILESTATS.GetB64Hash(path))) {
        return { data: true };
      }
      return { data: false };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static async PathsAreEqual(path0: string, path1: string): Promise<SQLQueryResult<boolean>> {
    try {
      path0 = NODE_PATH.join(path0);
      path1 = NODE_PATH.join(path1);
      const q0 = FILESTATS_DB.GetRecord[FILESTATS_ID.PATH]({ [FILESTATS_ID.PATH]: path0 });
      const q1 = FILESTATS_DB.GetRecord[FILESTATS_ID.PATH]({ [FILESTATS_ID.PATH]: path1 });
      if (q0 !== undefined && q1 !== undefined) {
        const current_mtimems0 = await FILESTATS.GetMTimeMS(path0);
        const current_mtimems1 = await FILESTATS.GetMTimeMS(path1);
        if (q0[FILESTATS_ID.MTIMEMS] === current_mtimems0 && q1[FILESTATS_ID.MTIMEMS] === current_mtimems1 && q0[FILESTATS_ID.HASH] === q1[FILESTATS_ID.HASH]) {
          return { data: true };
        }
        const current_hash0 = await FILESTATS.GetHash(path0);
        const current_hash1 = await FILESTATS.GetHash(path1);
        if (current_hash0 === current_hash1) {
          FILESTATS_DB.UpdateRecord({ [FILESTATS_ID.PATH]: NODE_PATH.join(path0), [FILESTATS_ID.MTIMEMS]: current_mtimems1, [FILESTATS_ID.HASH]: btoa(current_hash1.toString()) });
          FILESTATS_DB.UpdateRecord({ [FILESTATS_ID.PATH]: NODE_PATH.join(path1), [FILESTATS_ID.MTIMEMS]: current_mtimems0, [FILESTATS_ID.HASH]: btoa(current_hash0.toString()) });
          return { data: true };
        }
      }
      return { data: false };
    } catch (error) {
      return CreateQueryError(error);
    }
  }
  static async GetB64Hash(path: string): Promise<string> {
    const hash = await FILESTATS.GetHash(path);
    return btoa(hash.toString());
  }
  static async GetHash(path: string): Promise<bigint> {
    const { error, value: bytes } = await Async_BunPlatform_File_Read_Bytes(path);
    if (bytes !== undefined) {
      return Bun.hash.wyhash(bytes);
    }
    throw error;
  }
  static async GetMTimeMS(path: string): Promise<number> {
    const { error, value: stats } = await Async_NodePlatform_Path_Get_Stats(path);
    if (stats !== undefined) {
      return stats.mtimeMs;
    }
    throw error;
  }
}

// functions

function CreateGetQuery<ReturnType, Bindings extends SQLQueryBindings>(return_type: new (...args: any[]) => ReturnType, query: string, bindings?: Bindings) {
  const statement = cachedb.query(query).as(return_type);
  return (bindings?: Bindings) => statement.get(bindings ?? {}) ?? undefined;
}
function CreateAllQuery<ReturnType, Bindings extends SQLQueryBindings>(return_type: new (...args: any[]) => ReturnType, query: string, bindings?: Bindings) {
  const statement = cachedb.query(query).as(return_type);
  return (bindings?: Bindings) => statement.all(bindings ?? {}) ?? undefined;
}
function CreateRunQuery<Bindings extends SQLQueryBindings>(query: string, bindings?: Bindings) {
  const statement = cachedb.query(query);
  return (bindings?: Bindings) => statement.run(bindings ?? {});
}
function CreateQueryError(message: any, options?: Record<string, any>): SQLQueryError {
  return { error: { message, options } };
}

// watcher

export function Cacher_Watch_Directory(
  path: string, //
  min_delay_ms: number,
  callback: (added: Set<string>, deleted: Set<string>, modified: Set<string>) => Promise<void>,
): () => void {
  let delay_ms = min_delay_ms;
  let scan_count = 0;
  let timer_id: Parameters<typeof clearTimeout>[0] = undefined;
  let abort = false;

  const glob = new Bun.Glob('**');

  async function scan() {
    try {
      if (abort === true) return;

      const added_set = new Set<string>();
      const deleted_set = new Set<string>();
      const modified_set = new Set<string>();

      for (const subpath of await Array.fromAsync(
        glob.scan({
          absolute: false,
          cwd: path,
          dot: true,
          followSymlinks: false,
          onlyFiles: true,
          throwErrorOnBrokenSymlink: false,
        }),
      )) {
        if (BunPlatform_Glob_Match(subpath, '**/node_modules/**') !== true) {
          added_set.add(NODE_PATH.join(path, subpath));
        }
      }

      const query_results = FILESTATS.QueryStatsLike(path);
      if (query_results.data !== undefined) {
        for (const record of query_results.data) {
          const record_path = record[FILESTATS_ID.PATH] as string;
          if (added_set.has(record_path)) {
            // check for modification
            const { data: modified } = await FILESTATS.UpdateRecordIfModified(record);
            if (modified === true) {
              modified_set.add(record_path);
            }
          } else {
            FILESTATS.RemoveStats(record_path);
            deleted_set.add(record_path);
          }
          added_set.delete(record_path);
        }
      }

      for (const path of added_set) {
        await FILESTATS.UpdateStats(path);
      }

      // @ts-ignore typescript doesn't understand asynchronous code
      if (abort === true) return;

      await callback(added_set, deleted_set, modified_set);

      if (added_set.size > 0 || deleted_set.size > 0 || modified_set.size > 0) {
        // reset
        delay_ms = min_delay_ms;
        scan_count = 0;
      } else {
        if (delay_ms < 10_000) {
          if (scan_count++ >= 10) {
            delay_ms += 250;
            scan_count = 0;
          }
        }
      }

      timer_id = setTimeout(() => Core_Promise_Orphan(scan()), delay_ms);
    } catch (error) {
      Core_Console_Error(`${Cacher_Watch_Directory.name}: Error during scan:`, error);
    }
  }
  timer_id = setTimeout(() => Core_Promise_Orphan(scan()), delay_ms);

  return () => {
    clearTimeout(timer_id);
    abort = true;
  };
}

// cleanup

process.on('beforeExit', () => {});
process.on('exit', () => {
  CACHELOCK.UnlockAll();
});
