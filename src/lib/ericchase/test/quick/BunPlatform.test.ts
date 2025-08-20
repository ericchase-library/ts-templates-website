import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { BunPlatform_Argv_Includes } from '../../BunPlatform_Argv_Includes.js';
import { Async_BunPlatform_Extract_Env_From_Dir } from '../../BunPlatform_Extract_Env_From_Dir.js';
import { Async_BunPlatform_File_Compare } from '../../BunPlatform_File_Compare.js';
import { Async_BunPlatform_File_Copy } from '../../BunPlatform_File_Copy.js';
import { Async_BunPlatform_File_Move } from '../../BunPlatform_File_Move.js';
import { Async_BunPlatform_File_Read_Bytes } from '../../BunPlatform_File_Read_Bytes.js';
import { Async_BunPlatform_File_Read_Text } from '../../BunPlatform_File_Read_Text.js';
import { Async_BunPlatform_File_Write_Bytes } from '../../BunPlatform_File_Write_Bytes.js';
import { Async_BunPlatform_File_Write_Text } from '../../BunPlatform_File_Write_Text.js';
import { BunPlatform_Glob_Match } from '../../BunPlatform_Glob_Match.js';
import { BunPlatform_Glob_Match_Ex } from '../../BunPlatform_Glob_Match_Ex.js';
import { Async_BunPlatform_Glob_Scan_Ex } from '../../BunPlatform_Glob_Scan_Ex.js';
import { Async_BunPlatform_Glob_Scan_Generator } from '../../BunPlatform_Glob_Scan_Generator.js';
import { Core_Console_Error } from '../../Core_Console_Error.js';
import { Core_Console_Log } from '../../Core_Console_Log.js';
import { NODE_FS, NODE_OS, NODE_PATH } from '../../NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../NodePlatform_PathObject_Relative_Class.js';

const temp_directory = await NODE_FS.mkdtemp(NODE_PATH.join(NODE_OS.tmpdir(), 'NodePlatform.test.ts-'));
const temp_directory_directory = NODE_PATH.join(temp_directory, 'temp_directory_directory');
const temp_directory_directory_junction = NODE_PATH.join(temp_directory_directory, 'temp_directory_directory_junction');
const temp_directory_directory_symbolic_link = NODE_PATH.join(temp_directory_directory, 'temp_directory_directory_symbolic_link');
const temp_directory_file = NODE_PATH.join(temp_directory, 'temp_directory_file.txt');
const temp_directory_file_symbolic_link = NODE_PATH.join(temp_directory, 'temp_directory_file_symbolic_link');
const temp_directory_path_does_not_exist = NODE_PATH.join(temp_directory, 'temp_directory_path_does_not_exist');
const temp_directory_path_does_not_exist_symbolic_link = NODE_PATH.join(temp_directory, 'temp_directory_path_does_not_exist_symbolic_link');
const temp_directory_recursive_symbolic_link_one = NODE_PATH.join(temp_directory, 'temp_directory_recursive_symbolic_link_one');
const temp_directory_recursive_symbolic_link_two = NODE_PATH.join(temp_directory, 'temp_directory_recursive_symbolic_link_two');
const case_directory = NODE_PATH.join(temp_directory, 'case_directory');
const case_directory_file = NODE_PATH.join(case_directory, 'case_directory_file');
const case_directory_directory = NODE_PATH.join(case_directory, 'case_directory_directory');
const case_directory_directory_file = NODE_PATH.join(case_directory_directory, 'case_directory_directory_file');
const BYTE_ABC = new Uint8Array([65, 66, 67]);
const BYTE_DEF = new Uint8Array([68, 69, 70]);
const TEXT_ABC = 'ABC';
const TEXT_DEF = 'DEF';

async function CleanDir(path: string) {
  await NODE_FS.rm(path, { recursive: true, force: true });
  expect(() => NODE_FS.stat(path)).toThrow();
  await NODE_FS.mkdir(path, { recursive: true });
  expect(() => NODE_FS.stat(path)).not.toThrow();
}
async function RemovePath(path: string) {
  await NODE_FS.rm(path, { recursive: true, force: true });
  expect(() => NODE_FS.stat(path)).toThrow();
}
async function ReadBytes(path: string, data: Uint8Array) {
  expect(Uint8Array.from(await NODE_FS.readFile(path))).toEqual(data.slice());
}
async function ReadText(path: string, data: string) {
  expect(await NODE_FS.readFile(path, { encoding: 'utf8' })).toBe(data);
}
async function WriteText(path: string, data: string) {
  await NODE_FS.mkdir(NODE_PATH.parse(path).dir, { recursive: true });
  await NODE_FS.writeFile(path, data);
  expect(await NODE_FS.readFile(path, { encoding: 'utf8' })).toBe(data);
}
async function mkdir(path: string) {
  await NODE_FS.mkdir(path, { recursive: true });
}
async function rm(path: string) {
  await NODE_FS.rm(path, { recursive: true, force: true });
}
async function symlink(target_path: string, link_path: string, link_type?: 'file' | 'dir' | 'junction') {
  await NODE_FS.symlink(target_path, link_path, link_type);
}
async function writeFile(path: string, data: string) {
  await NODE_FS.writeFile(path, data);
}

beforeAll(async () => {
  try {
    await mkdir(temp_directory);
    await mkdir(temp_directory_directory);
    await symlink(temp_directory_directory, temp_directory_directory_junction, 'junction');
    await symlink(temp_directory_directory, temp_directory_directory_symbolic_link);
    await writeFile(temp_directory_file, TEXT_ABC);
    await symlink(temp_directory_file, temp_directory_file_symbolic_link);
    await symlink(temp_directory_path_does_not_exist, temp_directory_path_does_not_exist_symbolic_link);
    await symlink(temp_directory_recursive_symbolic_link_two, temp_directory_recursive_symbolic_link_one, 'file');
    await symlink(temp_directory_recursive_symbolic_link_one, temp_directory_recursive_symbolic_link_two, 'file');
  } catch (error: any) {
    Core_Console_Log(error.stack);
    throw error;
  }
});

afterAll(async () => {
  await rm(temp_directory);
});

const runner = {
  '[01] path is directory and empty': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[01] path is directory and empty'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[02] path is directory and NOT empty': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[02] path is directory and NOT empty'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
        await WriteText(case_directory_file, TEXT_ABC);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[03] path is file': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[03] path is file'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
        await WriteText(case_directory_file, TEXT_ABC);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory_file);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[04] parent path is file': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[04] parent path is file'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
        await WriteText(case_directory_file, TEXT_ABC);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(NODE_PATH.join(case_directory_file, 'parent_path_is_file'));
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[05] path does NOT exist and parent path does NOT exist': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[05] path does NOT exist and parent path does NOT exist'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await RemovePath(case_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[06] path does NOT exist but parent path does exist': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[06] path does NOT exist but parent path does exist'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory_directory);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[07] path is junction to directory': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[07] path is junction to directory'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(temp_directory_directory);
        await symlink(temp_directory_directory, temp_directory_directory_junction, 'junction');
        await symlink(temp_directory_directory, temp_directory_directory_symbolic_link);
      } catch {}
      try {
        await fn(temp_directory_directory_junction);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[08] path is symbolic link to directory': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[08] path is symbolic link to directory'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(temp_directory_directory);
        await symlink(temp_directory_directory, temp_directory_directory_junction, 'junction');
        await symlink(temp_directory_directory, temp_directory_directory_symbolic_link);
      } catch {}
      try {
        await fn(temp_directory_directory_symbolic_link);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[09] path is symbolic link to file': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[09] path is symbolic link to file'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await WriteText(temp_directory_file, TEXT_ABC);
        await symlink(temp_directory_file, temp_directory_file_symbolic_link);
      } catch {}
      try {
        await fn(temp_directory_file_symbolic_link);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[10] path is symbolic link to does NOT exist': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[10] path is symbolic link to does NOT exist'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await rm(temp_directory_path_does_not_exist);
        await symlink(temp_directory_path_does_not_exist, temp_directory_path_does_not_exist_symbolic_link);
      } catch {}
      try {
        await fn(temp_directory_path_does_not_exist_symbolic_link);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[11] path is recursive symbolic link': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[11] path is recursive symbolic link'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await symlink(temp_directory_recursive_symbolic_link_two, temp_directory_recursive_symbolic_link_one, 'file');
        await symlink(temp_directory_recursive_symbolic_link_one, temp_directory_recursive_symbolic_link_two, 'file');
      } catch {}
      try {
        await fn(temp_directory_recursive_symbolic_link_one);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[12] path contains null byte': (fn: (path: string) => Promise<void>, message?: string) => {
    const casename = runner['[12] path contains null byte'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await fn('\0');
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[13] paths are different files with same content': (fn: (path1: string, path2: string) => Promise<void>, message?: string) => {
    const casename = runner['[13] paths are different files with same content'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
        await WriteText(case_directory_file, TEXT_ABC);
        await WriteText(case_directory_directory_file, TEXT_ABC);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory_file, case_directory_directory_file);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[14] paths are different files with different content': (fn: (path1: string, path2: string) => Promise<void>, message?: string) => {
    const casename = runner['[14] paths are different files with different content'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory);
        await WriteText(case_directory_file, TEXT_ABC);
        await WriteText(case_directory_directory_file, TEXT_DEF);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory_file, case_directory_directory_file);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
  '[15] one path is file, one path does not exist': (fn: (path1: string, path2: string) => Promise<void>, message?: string) => {
    const casename = runner['[15] one path is file, one path does not exist'].name;
    test(casename + (message ? ' > ' + message : ''), async () => {
      try {
        await CleanDir(case_directory_directory);
        await WriteText(case_directory_file, TEXT_ABC);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
      try {
        await fn(case_directory_file, case_directory_directory_file);
      } catch (error) {
        Core_Console_Error(Error('@ "' + casename + '"'));
        throw error;
      }
    });
  },
};

describe(BunPlatform_Argv_Includes.name, () => {
  test('argv includes query', () => {
    Bun.argv.push('ABC');
    expect(BunPlatform_Argv_Includes('ABC')).toBeTrue();
    Bun.argv.pop();
  });
  test('argv does not include query', () => {
    expect(BunPlatform_Argv_Includes('DEF')).toBeFalse();
  });
});

describe(Async_BunPlatform_Extract_Env_From_Dir.name, () => {
  test('extract VALUE=1 from .env.test-1', async () => {
    const result = await Async_BunPlatform_Extract_Env_From_Dir({ cwd: __dirname, envfiles: ['.env.test-1'] }, 'VALUE');
    expect(result.type).toBe('json');
    expect(result.value).toHaveProperty('VALUE', '1');
  });
  test('extract VALUE=2 from .env.test-2', async () => {
    const result = await Async_BunPlatform_Extract_Env_From_Dir({ cwd: __dirname, envfiles: ['.env.test-2'] }, 'VALUE');
    expect(result.type).toBe('json');
    expect(result.value).toHaveProperty('VALUE', '2');
  });
});

describe(Async_BunPlatform_File_Compare.name, async () => {
  async function fn(from_path: string, to_path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Compare(from_path, to_path);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, path, true);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, path, true);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, path, false);
  });
  runner['[13] paths are different files with same content'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
  runner['[14] paths are different files with different content'](async (path1, path2) => {
    await fn(path1, path2, false);
  });
  runner['[15] one path is file, one path does not exist'](async (path1, path2) => {
    await fn(path1, path2, false);
  });
});

describe(Async_BunPlatform_File_Copy.name + ' { overwrite = false }', async () => {
  async function fn(from_path: string, to_path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Copy(from_path, to_path, false);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, path, false);
  });
  runner['[13] paths are different files with same content'](async (path1, path2) => {
    await fn(path1, path2, false);
  });
  runner['[14] paths are different files with different content'](async (path1, path2) => {
    await fn(path1, path2, false);
  });
  runner['[15] one path is file, one path does not exist'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
});

describe(Async_BunPlatform_File_Copy.name + ' { overwrite = true }', async () => {
  async function fn(from_path: string, to_path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Copy(from_path, to_path, true);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, path, false);
  });
  runner['[13] paths are different files with same content'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
  runner['[14] paths are different files with different content'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
  runner['[15] one path is file, one path does not exist'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
});

describe(Async_BunPlatform_File_Move.name + ' { overwrite = false }', async () => {
  async function fn(from_path: string, to_path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Move(from_path, to_path, false);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, path, false);
  });
  runner['[13] paths are different files with same content'](async (path1, path2) => {
    await fn(path1, path2, false);
  });
  runner['[14] paths are different files with different content'](async (path1, path2) => {
    await fn(path1, path2, false);
  });
  runner['[15] one path is file, one path does not exist'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
});

describe(Async_BunPlatform_File_Move.name + ' { overwrite = true }', async () => {
  async function fn(from_path: string, to_path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Move(from_path, to_path, true);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, path, false);
  });
  runner['[13] paths are different files with same content'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
  runner['[14] paths are different files with different content'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
  runner['[15] one path is file, one path does not exist'](async (path1, path2) => {
    await fn(path1, path2, true);
  });
});

describe(Async_BunPlatform_File_Read_Bytes.name, async () => {
  async function fn(path: string, expected?: Uint8Array) {
    const { value } = await Async_BunPlatform_File_Read_Bytes(path);
    expect<Uint8Array | undefined>(value).toEqual(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, undefined);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, undefined);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, BYTE_ABC);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, undefined);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, undefined);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, undefined);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, undefined);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, undefined);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, BYTE_ABC);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, undefined);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, undefined);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, undefined);
  });
});

describe(Async_BunPlatform_File_Read_Text.name, async () => {
  async function fn(path: string, expected?: string) {
    const { value } = await Async_BunPlatform_File_Read_Text(path);
    expect<string | undefined>(value).toEqual(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, undefined);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, undefined);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, TEXT_ABC);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, undefined);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, undefined);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, undefined);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, undefined);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, undefined);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, TEXT_ABC);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, undefined);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, undefined);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, undefined);
  });
});

describe(Async_BunPlatform_File_Write_Bytes.name, async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Write_Bytes(path, BYTE_DEF);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, false);
  });
  runner['[03] path is file'](async (path) => {
    await ReadBytes(path, BYTE_ABC);
    await fn(path, true);
    await ReadBytes(path, BYTE_DEF);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, true);
    await ReadBytes(path, BYTE_DEF);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
    await ReadBytes(path, BYTE_DEF);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await ReadBytes(path, BYTE_ABC);
    await fn(path, true);
    await ReadBytes(path, BYTE_DEF);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, true);
    await ReadBytes(path, BYTE_DEF);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(Async_BunPlatform_File_Write_Text.name, async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_BunPlatform_File_Write_Text(path, TEXT_DEF);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, false);
  });
  runner['[03] path is file'](async (path) => {
    await ReadText(path, TEXT_ABC);
    await fn(path, true);
    await ReadText(path, TEXT_DEF);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, true);
    await ReadText(path, TEXT_DEF);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
    await ReadText(path, TEXT_DEF);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await ReadText(path, TEXT_ABC);
    await fn(path, true);
    await ReadText(path, TEXT_DEF);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, true);
    await ReadText(path, TEXT_DEF);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(BunPlatform_Glob_Match.name, async () => {
  async function fn(query: string, pattern: string, expected: boolean) {
    expect(BunPlatform_Glob_Match(query, pattern)).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, '**', true);
  });
});

describe(BunPlatform_Glob_Match_Ex.name, async () => {
  async function fn(query: string, include_patterns: string[], exclude_patterns: string[], expected: boolean) {
    expect(BunPlatform_Glob_Match_Ex(query, include_patterns, exclude_patterns)).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, ['**'], [], true);
    await fn(path, ['**'], ['**/case_directory'], false);
  });
});

describe(Async_BunPlatform_Glob_Scan_Ex.name, async () => {
  async function fn(path: string, expected: string[]) {
    const entries = Array.from(await Async_BunPlatform_Glob_Scan_Ex(path, ['**'], [], { absolute_paths: false, only_files: false }));
    for (const entry of entries) {
      expect(entry).toBeOneOf(expected);
    }
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, []);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await mkdir(case_directory_directory);
    await writeFile(case_directory_directory_file, TEXT_ABC);
    await fn(path, [
      'case_directory_directory', //
      'case_directory_file',
      NodePlatform_PathObject_Relative_Class('case_directory_directory', 'case_directory_directory_file').join(),
    ]);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, []);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, []);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, []);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, []);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, []);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, []);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, []);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, []);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, []);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, []);
  });
});

describe(Async_BunPlatform_Glob_Scan_Generator.name, async () => {
  async function fn(path: string, expected: string[]) {
    const entries = await Array.fromAsync(Async_BunPlatform_Glob_Scan_Generator(path, '**', { absolute_paths: false, only_files: false }));
    for (const entry of entries) {
      expect(entry).toBeOneOf(expected);
    }
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, []);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await mkdir(case_directory_directory);
    await writeFile(case_directory_directory_file, TEXT_ABC);
    await fn(path, [
      'case_directory_directory', //
      'case_directory_file',
      NodePlatform_PathObject_Relative_Class('case_directory_directory', 'case_directory_directory_file').join(),
    ]);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, []);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, []);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, []);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, []);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, []);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, []);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, []);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, []);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, []);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, []);
  });
});
