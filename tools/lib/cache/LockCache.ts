import { TaskRepeater } from '../../../src/lib/ericchase/Utility/Task_TaskRepeater.js';
import { cache_db, CreateAllQuery, CreateGetQuery, CreateRunQuery, QueryError, QueryExistsResult, QueryResult } from './cache.js';

const TAG = 'tag';
const PID = 'pid';
const LAST_ACCESS_TIME = 'last_access_time';

class LOCK_RECORD {
  [TAG]?: string;
  [PID]?: number;
  [LAST_ACCESS_TIME]?: number;
}

const TABLE = 'lock';

const CREATE_TABLE = /* sql */ `
  CREATE TABLE IF NOT EXISTS ${TABLE} (
    ${TAG} TEXT PRIMARY KEY NOT NULL,
    ${PID} INTEGER NOT NULL,
    ${LAST_ACCESS_TIME} INTEGER NOT NULL
  )
`;
cache_db.run(CREATE_TABLE);

const GET_ALL_RECORDS = /* sql */ `
  SELECT *
    FROM ${TABLE}
`;
const getAllLocks = CreateAllQuery(LOCK_RECORD, GET_ALL_RECORDS);

const GET_RECORD = /* sql */ `
  SELECT *
    FROM ${TABLE}
   WHERE ${TAG} = $${TAG}
`;
const getLock = {
  [TAG]: CreateGetQuery(LOCK_RECORD, GET_RECORD, { [TAG]: '' }),
};
const getLocks = {
  [TAG]: CreateAllQuery(LOCK_RECORD, GET_RECORD, { [TAG]: '' }),
};

const INSERT_LOCK = /* sql */ `
  INSERT INTO ${TABLE} (${TAG}, ${PID}, ${LAST_ACCESS_TIME})
  VALUES ($${TAG}, $${PID}, strftime('%s', 'now'))
`;
const insertLock = CreateRunQuery(INSERT_LOCK, { [TAG]: '', [PID]: 0 });

const IS_LOCK_ACTIVE = /* sql */ `
  SELECT EXISTS(
    SELECT 1
      FROM ${TABLE}
     WHERE ${TAG} = $${TAG}
       AND ${LAST_ACCESS_TIME} > strftime('%s', 'now', '-3 seconds')
  ) AS result;
`;
const isLockActive = CreateGetQuery(QueryExistsResult, IS_LOCK_ACTIVE, { [TAG]: '' });

const REMOVE_ALL_LOCKS = /* sql */ `
  DELETE FROM ${TABLE}
   WHERE ${PID} = $${PID}
`;
const removeAllLocks = CreateRunQuery(REMOVE_ALL_LOCKS, { [PID]: 0 });

const REMOVE_LOCK = /* sql */ `
  DELETE FROM ${TABLE}
   WHERE ${TAG} = $${TAG}
     AND ${PID} = $${PID}
`;
const removeLock = CreateRunQuery(REMOVE_LOCK, { [TAG]: '', [PID]: 0 });

const REMOVE_LOCK_BY_FORCE = /* sql */ `
  DELETE FROM ${TABLE}
   WHERE ${TAG} = $${TAG}
`;
const removeLockByForce = CreateRunQuery(REMOVE_LOCK_BY_FORCE, { [TAG]: '' });

const UPDATE_LOCK = /* sql */ `
  UPDATE ${TABLE}
     SET ${LAST_ACCESS_TIME} = strftime('%s', 'now')
   WHERE ${PID} = $${PID}
`;
const updateLock = CreateRunQuery(UPDATE_LOCK, { [PID]: 0 });

const Updater = {
  locks: new Set<string>(),
  updater: new TaskRepeater(
    () => {
      try {
        updateLock({ [PID]: process.pid });
      } catch (error) {}
    },
    2000,
    false,
  ),
  add(tag: string) {
    Updater.locks.add(tag);
    Updater.updater.start();
  },
  remove(tag: string) {
    Updater.locks.delete(tag);
    if (Updater.locks.size < 1) {
      Updater.updater.stop();
    }
  },
  removeAll() {
    Updater.updater.stop();
    Updater.locks.clear();
  },
};

export function Cache_IsLocked(tag: string): QueryResult<boolean> {
  try {
    return { data: isLockActive({ tag })?.result === 1 };
  } catch (error) {
    return QueryError(error);
  }
}

export function Cache_Lock(tag: string): QueryResult<boolean> {
  try {
    const r0 = Cache_LockStatus(tag);
    if (r0.error) return r0;
    if (r0.data.mine) {
      Updater.add(tag);
      return { data: true };
    }
    if (r0.data.locked) {
      return { data: false };
    }
    removeLockByForce({ tag });
    insertLock({ tag, pid: process.pid });
    const r1 = Cache_LockStatus(tag);
    if (r1.error) return r1;
    if (r1.data.mine) {
      Updater.add(tag);
      return { data: true };
    }
    return { data: false };
  } catch (error) {
    return QueryError(error);
  }
}

export function Cache_LockEach(tags: string[]):
  | { success: true; tag?: undefined; error?: undefined } //
  | { success: false; tag: string; error?: any } {
  for (const tag of tags) {
    try {
      const r0 = Cache_Lock(tag);
      if (r0.error || r0.data === false) {
        Cache_UnlockEach(tags);
        return { success: false, tag, error: r0.error };
      }
    } catch (error) {
      Cache_UnlockEach(tags);
      return { success: false, tag, error };
    }
  }
  return { success: true };
}

export function Cache_LockOrExit(tag: string, on_exit?: (error?: unknown) => void): void {
  try {
    const r0 = Cache_Lock(tag);
    if (r0.error || r0.data === false) {
      on_exit?.(r0.error);
      process.exit();
    }
  } catch (error) {
    on_exit?.(error);
    process.exit();
  }
}

export function Cache_LockEachOrExit(tags: string[], on_exit?: (tag: string, error?: unknown) => void): void {
  const r0 = Cache_LockEach(tags);
  if (r0.success === false) {
    on_exit?.(r0.tag, r0.error);
    process.exit();
  }
}

export function Cache_LockStatus(tag: string): QueryResult<{ locked: boolean; mine: boolean }> {
  try {
    const q0 = getLock[TAG]({ [TAG]: tag });
    if (q0) {
      const mine = q0.pid === process.pid;
      return { data: { locked: isLockActive({ tag })?.result === 1, mine } };
    }
    return { data: { locked: false, mine: false } };
  } catch (error) {
    return QueryError(error);
  }
}

export function Cache_Unlock(tag: string): void {
  Updater.remove(tag);
  removeLock({ tag, pid: process.pid });
}

export function Cache_UnlockAll(): void {
  Updater.removeAll();
  removeAllLocks({ [PID]: process.pid });
}

export function Cache_UnlockEach(tags: string[]): void {
  for (const tag of tags) {
    Cache_Unlock(tag);
  }
}

process.on('beforeExit', () => {
  Cache_UnlockAll();
});
process.on('exit', () => {
  Cache_UnlockAll();
});

export function Cache_TryLock(script: string) {
  Cache_LockOrExit(script, (error) => {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    console['error'](`Another process is locking ${script}. Please wait for that process to end.`, error ?? '');
  });
}

export function Cache_TryLockEach(scripts: string[]) {
  Cache_LockEachOrExit(scripts, (script, error) => {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    console['error'](`Another process is locking ${script}. Please wait for that process to end.`, error ?? '');
  });
}
