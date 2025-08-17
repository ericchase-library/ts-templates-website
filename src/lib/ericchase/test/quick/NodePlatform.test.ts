import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { Core_Console_Error } from '../../Core_Console_Error.js';
import { Core_Console_Log } from '../../Core_Console_Log.js';
import { NODE_FS, NODE_NET, NODE_OS, NODE_PATH } from '../../NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../NodePlatform_Directory_Create.js';
import { Async_NodePlatform_Directory_Delete } from '../../NodePlatform_Directory_Delete.js';
import { Async_NodePlatform_Directory_ReadDir } from '../../NodePlatform_Directory_ReadDir.js';
import { Async_NodePlatform_File_Append_Bytes } from '../../NodePlatform_File_Append_Bytes.js';
import { Async_NodePlatform_File_Append_Text } from '../../NodePlatform_File_Append_Text.js';
import { Async_NodePlatform_File_Delete } from '../../NodePlatform_File_Delete.js';
import { Async_NodePlatform_File_Read_Bytes } from '../../NodePlatform_File_Read_Bytes.js';
import { Async_NodePlatform_File_Read_Text } from '../../NodePlatform_File_Read_Text.js';
import { Async_NodePlatform_File_Write_Bytes } from '../../NodePlatform_File_Write_Bytes.js';
import { Async_NodePlatform_File_Write_Text } from '../../NodePlatform_File_Write_Text.js';
import { Async_NodePlatform_Path_Delete } from '../../NodePlatform_Path_Delete.js';
import { Async_NodePlatform_Path_Exists } from '../../NodePlatform_Path_Exists.js';
import { Async_NodePlatform_Path_Get_Stats } from '../../NodePlatform_Path_Get_Stats.js';
import { Async_NodePlatform_Path_Get_Stats_SymbolicLink } from '../../NodePlatform_Path_Get_Stats_SymbolicLink.js';
import { Async_NodePlatform_Path_Is_Directory } from '../../NodePlatform_Path_Is_Directory.js';
import { Async_NodePlatform_Path_Is_File } from '../../NodePlatform_Path_Is_File.js';
import { Async_NodePlatform_Path_Is_SymbolicLink } from '../../NodePlatform_Path_Is_SymbolicLink.js';

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
const temp_directory_fifo_device = NODE_PATH.join(temp_directory, 'temp_fifo_device');
const temp_directory_socket_device = NODE_PATH.join(temp_directory, 'temp_socket_device');
const case_directory = NODE_PATH.join(temp_directory, 'case_directory');
const case_directory_file = NODE_PATH.join(case_directory, 'case_directory_file');
const case_directory_directory = NODE_PATH.join(case_directory, 'case_directory_directory');
const case_directory_directory_file = NODE_PATH.join(case_directory_directory, 'case_directory_directory_file');
const win32_path_length_too_long_with_segments = 'C:' + Array.from({ length: 127 }, () => '\\' + 'a'.repeat(255)).join('') + '\\' + 'a'.repeat(255 - 31);
const win32_path_length_too_long_without_segments = 'C:\\' + 'a'.repeat(2 ** 15 - 32);
const win32_path_length_1_character_less_than_too_long_with_segments = 'C:' + Array.from({ length: 127 }, () => '\\' + 'a'.repeat(255)).join('') + '\\' + 'a'.repeat(255 - 31 - 1);
const win32_path_length_1_character_less_than_too_long_without_segments = 'C:\\' + 'a'.repeat(2 ** 15 - 32 - 1);
const posix_path_segment_too_long = 'a'.repeat(256);
const posix_path_length_too_long = '/' + Array.from({ length: 16 }, () => 'a'.repeat(255)).join('/');
const posix_path_segment_1_character_less_than_too_long = 'a'.repeat(256 - 1);
const posix_path_length_1_character_less_than_too_long = '/' + Array.from({ length: 15 }, () => 'a'.repeat(255)).join('/') + '/' + 'a'.repeat(255 - 1);
const BYTE_ABC = new Uint8Array([65, 66, 67]);
const BYTE_DEF = new Uint8Array([68, 69, 70]);
const BYTE_ABCDEF = new Uint8Array([65, 66, 67, 68, 69, 70]);
const TEXT_ABC = 'ABC';
const TEXT_DEF = 'DEF';
const TEXT_ABCDEF = 'ABCDEF';
let socket_server: NODE_NET.Server | undefined = undefined;

Core_Console_Log('Temp Directory:', temp_directory);

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
async function WriteBytes(path: string, data: Uint8Array) {
  await NODE_FS.mkdir(NODE_PATH.parse(path).dir, { recursive: true });
  await NODE_FS.writeFile(path, data);
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
  'win32': {
    '[13] path is NUL': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[13] path is NUL'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('NUL');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[14] path is CON': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[14] path is CON'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('CON');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[15] path is *': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[15] path is *'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('*');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[16] path length too long, with segments': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[16] path length too long, with segments'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          expect(win32_path_length_too_long_with_segments.length).toBe(32739);
          await fn(win32_path_length_too_long_with_segments);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[17] path length too long, without segments': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[17] path length too long, without segments'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          expect(win32_path_length_too_long_without_segments.length).toBe(32739);
          await fn(win32_path_length_too_long_without_segments);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[18] path length 1 character less than too long, with segments': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[18] path length 1 character less than too long, with segments'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          expect(win32_path_length_1_character_less_than_too_long_with_segments.length).toBe(32739 - 1);
          await fn(win32_path_length_1_character_less_than_too_long_with_segments);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[19] path length 1 character less than too long, without segments': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.win32['[19] path length 1 character less than too long, without segments'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          expect(win32_path_length_1_character_less_than_too_long_without_segments.length).toBe(32739 - 1);
          await fn(win32_path_length_1_character_less_than_too_long_without_segments);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
  },
  'posix': {
    '[13] path is FIFO device': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[13] path is FIFO device'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn(temp_directory_fifo_device);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[14] path is Socket device': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[14] path is Socket device'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn(temp_directory_socket_device);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[15] path is /dev/null': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[15] path is /dev/null'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('/dev/null');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[16] path is /dev/zero': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[16] path is /dev/zero'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('/dev/zero');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[17] path is /dev/sda': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[17] path is /dev/sda'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('/dev/sda');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[18] path is /dev/disk0': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[18] path is /dev/disk0'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn('/dev/disk0');
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[19] path segment length too long': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[19] path segment length too long'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn(posix_path_segment_too_long);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[20] path length too long': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[20] path length too long'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn(posix_path_length_too_long);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[21] path segment length 1 character less than too long': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[21] path segment length 1 character less than too long'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn(posix_path_segment_1_character_less_than_too_long);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
    '[22] path length 1 character less than too long': (fn: (path: string) => Promise<void>, message?: string) => {
      const casename = runner.posix['[22] path length 1 character less than too long'].name;
      test(casename + (message ? ' > ' + message : ''), async () => {
        try {
          await fn(posix_path_length_1_character_less_than_too_long);
        } catch (error) {
          Core_Console_Error(Error('@ "' + casename + '"'));
          throw error;
        }
      });
    },
  },
};

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
    if (process.platform === 'win32') {
    } else {
      Bun.spawnSync(['mkfifo', temp_directory_fifo_device]);
      await new Promise<void>((resolve, reject) => {
        try {
          socket_server = NODE_NET.createServer(() => {});
          socket_server.listen(temp_directory_socket_device, () => {
            resolve();
          });
        } catch {
          reject();
        }
      });
    }
  } catch (error: any) {
    Core_Console_Log(error.stack);
    throw error;
  }
});

afterAll(async () => {
  if (process.platform === 'win32') {
  } else {
    await new Promise<void>((resolve, reject) => {
      if (socket_server) {
        socket_server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  await rm(temp_directory);
});

describe(Async_NodePlatform_Path_Get_Stats.name, async () => {
  async function fn(path: string, { error_code, error_message, kind, optional }: { error_code?: string[]; error_message?: string; kind?: 'isBlockDevice' | 'isCharacterDevice' | 'isDirectory' | 'isFIFO' | 'isFile' | 'isSocket'; optional?: boolean }) {
    const { error, value: stats } = await Async_NodePlatform_Path_Get_Stats(path);
    if (stats === undefined && optional === true) {
      // ok to skip
    } else {
      if (kind) {
        expect(stats!.isBlockDevice()).toBe(kind === 'isBlockDevice');
        expect(stats!.isCharacterDevice()).toBe(kind === 'isCharacterDevice');
        expect(stats!.isDirectory()).toBe(kind === 'isDirectory');
        expect(stats!.isFIFO()).toBe(kind === 'isFIFO');
        expect(stats!.isFile()).toBe(kind === 'isFile');
        expect(stats!.isSocket()).toBe(kind === 'isSocket');
      }
    }
    if (error) {
      expect(error).toBeInstanceOf(Error);
      if (error_code) {
        expect(error.code).toBeOneOf(error_code);
      }
      if (error_message) {
        expect(error.message).toStartWith(error_message);
      }
    }
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, { kind: 'isDirectory' });
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, { kind: 'isDirectory' });
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, { kind: 'isFile' });
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, { error_code: ['ENOENT', 'ENOTDIR'] });
  }, 'Should throw ENOENT or ENOTDIR');
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, { error_code: ['ENOENT'] });
  }, 'Should throw ENOENT');
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, { error_code: ['ENOENT'] });
  }, 'Should throw ENOENT');
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, { kind: 'isDirectory' });
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, { kind: 'isDirectory' });
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, { kind: 'isFile' });
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, { error_code: ['ENOENT'] });
  }, 'Should throw ENOENT');
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, { error_code: ['ELOOP'] });
  }, 'Should throw ELOOP');
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, { error_message: "The argument 'path' must be a string, Uint8Array, or URL without null bytes." });
  }, 'Should throw custom error');

  if (process.platform === 'win32') {
    describe('win32', () => {
      /**
       * Here is an example of when fs.stats will successfully return stats for
       * a reserved name that is considered a Character Device.
       */
      runner.win32['[13] path is NUL'](async (path) => {
        await fn(path, { kind: 'isCharacterDevice' });
      });
      /**
       * Here is an example of when fs.stats will throw EINVAL when querying a
       * reserved name on Windows.
       */
      runner.win32['[14] path is CON'](async (path) => {
        await fn(path, { error_code: ['EINVAL'] });
      });
      /**
       * Here is an example of when fs.stats will throw ENOENT when querying a
       * reserved name on Windows. The user might incorrectly assume that the
       * path is valid but no file has been created for it. Like above, this
       * path is also invalid, but due to internal design, fs.stat uses ENOENT
       * instead of EINVAL.
       */
      runner.win32['[15] path is *'](async (path) => {
        await fn(path, { error_code: ['ENOENT'] });
      });
      /**
       * When long path support is enabled, Windows allows paths with up to
       * 2^15 characters minus a couple for things like internal null bytes. I
       * assume the same error code is used for lengths of 260~ when long path
       * support is not enabled. NTFS supposedly supports up to 255-260
       * characters per segment, but fs.stat doesn't seem to check with such
       * precision.
       *
       * Interestingly enough, if the path contains a valid root, somewhere
       * around 30 characters are reserved. Without a root, fs.stat allows the
       * full 2^15-1 characters. I'm not sure why this is.
       */
      runner.win32['[16] path length too long, with segments'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.win32['[17] path length too long, without segments'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      /**
       * This will indeed create the entire file path on Windows (I tested). As
       * long as the path segments are each less than 256 characters each, you
       * can create a full path up to 32,738 characters (as far as my Windows
       * 10 machine goes). I can navigate the resulting path tree, but File
       * Explorer won't let me delete it. I have to open up CMD for that.
       *
       * The final segment in this test is 223 characters. Attempting to add
       * just 1 more character will result in the ENAMETOOLONG error. I have
       * not confirmed whether this is a limitation of fs.stat or Windows'
       * internal api. What I have confirmed on my machine is that at 32,761
       * characters, Bun will internally fail.
       *
       * Note - On Windows, a path segment is the part between two backslashes:
       *   \<path segment>\
       */
      runner.win32['[18] path length 1 character less than too long, with segments'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
      runner.win32['[19] path length 1 character less than too long, without segments'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
    });
  } else {
    describe('posix', () => {
      /**
       * FIFO Devices are freely accessible on Posix systems and correctly
       * reported as FIFO Devices by fs.stat. On Windows, FIFO Devices are
       * considered files by fs.stat. The only way to confirm if a path is
       * actually a FIFO Device on Windows is to try connecting to it. Since
       * this test case is for fs.stat, we only test Posix systems here.
       */
      runner.posix['[13] path is FIFO device'](async (path) => {
        await fn(path, { kind: 'isFIFO' });
      });
      /**
       * Socket Devices are freely accessible on Posix systems, but result in
       * EACCES error on Windows, even though we literally created the socket
       * in this program. The user needs to be aware of this, so hopefully this
       * test case helps.
       */
      runner.posix['[14] path is Socket device'](async (path) => {
        await fn(path, { kind: 'isSocket' });
      });
      /** Mandated Character Device. */
      runner.posix['[15] path is /dev/null'](async (path) => {
        await fn(path, { kind: 'isCharacterDevice' });
      });
      /** Mandated Character Device. */
      runner.posix['[16] path is /dev/zero'](async (path) => {
        await fn(path, { kind: 'isCharacterDevice' });
      });
      /** Potential Block Device. Ignore if device does not exist. */
      runner.posix['[17] path is /dev/sda'](async (path) => {
        await fn(path, { kind: 'isBlockDevice', optional: true });
      });
      /** Potential Block Device. Ignore if device does not exist. */
      runner.posix['[18] path is /dev/disk0'](async (path) => {
        await fn(path, { kind: 'isBlockDevice', optional: true });
      });
      /**
       * On most Posix systems, the longest path length allowed is 4096
       * characters, and only 255 characters per segment. fs.stat seems to care
       * when segments are too long on Linux, so we can test for both.
       */
      runner.posix['[19] path segment length too long'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.posix['[20] path length too long'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.posix['[21] path segment length 1 character less than too long'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
      runner.posix['[22] path length 1 character less than too long'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
    });
  }
});

describe(Async_NodePlatform_Path_Get_Stats_SymbolicLink.name, async () => {
  async function fn(path: string, { error_code, error_message, kind, optional }: { error_code?: string[]; error_message?: string; kind?: 'isBlockDevice' | 'isCharacterDevice' | 'isDirectory' | 'isFIFO' | 'isFile' | 'isSocket' | 'isSymbolicLink'; optional?: boolean }) {
    const { error, value: stats } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
    if (stats === undefined && optional === true) {
      // ok to skip
    } else {
      if (kind) {
        expect(stats!.isBlockDevice()).toBe(kind === 'isBlockDevice');
        expect(stats!.isCharacterDevice()).toBe(kind === 'isCharacterDevice');
        expect(stats!.isDirectory()).toBe(kind === 'isDirectory');
        expect(stats!.isFIFO()).toBe(kind === 'isFIFO');
        expect(stats!.isFile()).toBe(kind === 'isFile');
        expect(stats!.isSocket()).toBe(kind === 'isSocket');
        expect(stats!.isSymbolicLink()).toBe(kind === 'isSymbolicLink');
      }
    }
    if (error) {
      expect(error).toBeInstanceOf(Error);
      if (error_code) {
        expect(error.code).toBeOneOf(error_code);
      }
      if (error_message) {
        expect(error.message).toStartWith(error_message);
      }
    }
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, { kind: 'isDirectory' });
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, { kind: 'isDirectory' });
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, { kind: 'isFile' });
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, { error_code: ['ENOENT', 'ENOTDIR'] });
  }, 'Should throw ENOENT or ENOTDIR');
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, { error_code: ['ENOENT'] });
  }, 'Should throw ENOENT');
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, { error_code: ['ENOENT'] });
  }, 'Should throw ENOENT');
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, { kind: 'isSymbolicLink' });
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, { kind: 'isSymbolicLink' });
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, { kind: 'isSymbolicLink' });
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, { kind: 'isSymbolicLink' });
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, { kind: 'isSymbolicLink' });
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, { error_message: "The argument 'path' must be a string, Uint8Array, or URL without null bytes." });
  }, 'Should throw custom error');

  if (process.platform === 'win32') {
    describe('win32', () => {
      runner.win32['[13] path is NUL'](async (path) => {
        await fn(path, { kind: 'isCharacterDevice' });
      });
      runner.win32['[14] path is CON'](async (path) => {
        await fn(path, { error_code: ['EINVAL'] });
      });
      runner.win32['[15] path is *'](async (path) => {
        await fn(path, { error_code: ['ENOENT'] });
      });
      runner.win32['[16] path length too long, with segments'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.win32['[17] path length too long, without segments'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.win32['[18] path length 1 character less than too long, with segments'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
      runner.win32['[19] path length 1 character less than too long, without segments'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
    });
  } else {
    describe('posix', () => {
      runner.posix['[13] path is FIFO device'](async (path) => {
        await fn(path, { kind: 'isFIFO' });
      });
      runner.posix['[14] path is Socket device'](async (path) => {
        await fn(path, { kind: 'isSocket' });
      });
      /** Mandated Character Device. */
      runner.posix['[15] path is /dev/null'](async (path) => {
        await fn(path, { kind: 'isCharacterDevice' });
      });
      /** Mandated Character Device. */
      runner.posix['[16] path is /dev/zero'](async (path) => {
        await fn(path, { kind: 'isCharacterDevice' });
      });
      /** Potential Block Device. Ignore if device does not exist. */
      runner.posix['[17] path is /dev/sda'](async (path) => {
        await fn(path, { kind: 'isBlockDevice', optional: true });
      });
      /** Potential Block Device. Ignore if device does not exist. */
      runner.posix['[18] path is /dev/disk0'](async (path) => {
        await fn(path, { kind: 'isBlockDevice', optional: true });
      });
      runner.posix['[19] path segment length too long'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.posix['[20] path length too long'](async (path) => {
        await fn(path, { error_code: ['ENAMETOOLONG'] });
      });
      runner.posix['[21] path segment length 1 character less than too long'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
      runner.posix['[22] path length 1 character less than too long'](async (path) => {
        const { error } = await Async_NodePlatform_Path_Get_Stats_SymbolicLink(path);
        expect(error.code).not.toBe('ENAMETOOLONG');
      });
    });
  }
});

describe(Async_NodePlatform_Path_Is_Directory.name, async () => {
  async function fn(path: string, expected: boolean) {
    expect(await Async_NodePlatform_Path_Is_Directory(path)).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, true);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, true);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(Async_NodePlatform_Path_Is_File.name, async () => {
  async function fn(path: string, expected: boolean) {
    expect(await Async_NodePlatform_Path_Is_File(path)).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, true);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(Async_NodePlatform_Path_Is_SymbolicLink.name, async () => {
  async function fn(path: string, expected: boolean) {
    expect(await Async_NodePlatform_Path_Is_SymbolicLink(path)).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, true);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, true);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, true);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, true);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(Async_NodePlatform_Path_Delete.name, async () => {
  async function fn(path: string) {
    const { value } = await Async_NodePlatform_Path_Delete(path);
    expect(value).toBe(true);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path);
  });
});

describe(Async_NodePlatform_Path_Exists.name, async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_Path_Exists(path);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, true);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, true);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, true);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, false);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, true);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, true);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, true);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });

  if (process.platform === 'win32') {
    describe('win32', () => {
      runner.win32['[13] path is NUL'](async (path) => {
        await fn(path, true);
      });
      runner.win32['[14] path is CON'](async (path) => {
        await fn(path, false);
      });
      runner.win32['[15] path is *'](async (path) => {
        await fn(path, false);
      });
    });
  } else {
    describe('posix', () => {
      runner.posix['[13] path is FIFO device'](async (path) => {
        await fn(path, true);
      });
      runner.posix['[14] path is Socket device'](async (path) => {
        await fn(path, true);
      });
      /** Mandated Character Device. */
      runner.posix['[15] path is /dev/null'](async (path) => {
        await fn(path, true);
      });
      /** Mandated Character Device. */
      runner.posix['[16] path is /dev/zero'](async (path) => {
        await fn(path, true);
      });
    });
  }
});

describe(Async_NodePlatform_Directory_Create.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_Directory_Create(path, false);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, true);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, true);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(Async_NodePlatform_Directory_Create.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_Directory_Create(path, true);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, true);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, true);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, false);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, false);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, false);
  });
});

describe(Async_NodePlatform_Directory_Delete.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_Directory_Delete(path, false);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, true);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, true);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, true);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, true);
  });
});

describe(Async_NodePlatform_Directory_Delete.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_Directory_Delete(path, true);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, true);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, true);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, true);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, true);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, true);
  });
});

describe(Async_NodePlatform_Directory_ReadDir.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected?: string[]) {
    const { value } = await Async_NodePlatform_Directory_ReadDir(path, false);
    if (value !== undefined) {
      for (const entry of value) {
        expect(entry.name).toBeOneOf(expected ?? []);
      }
    }
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, []);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await mkdir(case_directory_directory);
    await writeFile(case_directory_directory_file, TEXT_ABC);
    await fn(path, ['case_directory_directory', 'case_directory_file']);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, undefined);
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
    await fn(path, undefined);
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

describe(Async_NodePlatform_Directory_ReadDir.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected?: string[]) {
    const { value } = await Async_NodePlatform_Directory_ReadDir(path, true);
    if (value !== undefined) {
      for (const entry of value) {
        expect(entry.name).toBeOneOf(expected ?? []);
      }
    }
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, []);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await mkdir(case_directory_directory);
    await writeFile(case_directory_directory_file, TEXT_ABC);
    await fn(path, ['case_directory_directory', 'case_directory_file', 'case_directory_directory_file']);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, undefined);
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
    await fn(path, undefined);
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

describe(Async_NodePlatform_File_Append_Bytes.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Append_Bytes(path, BYTE_DEF, false);
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
    await ReadBytes(path, BYTE_ABCDEF);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
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
    await ReadBytes(path, BYTE_ABCDEF);
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

describe(Async_NodePlatform_File_Append_Bytes.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Append_Bytes(path, BYTE_DEF, true);
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
    await ReadBytes(path, BYTE_ABCDEF);
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
    await ReadBytes(path, BYTE_ABCDEF);
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

describe(Async_NodePlatform_File_Append_Text.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Append_Text(path, TEXT_DEF, false);
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
    await ReadText(path, TEXT_ABCDEF);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, false);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, false);
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
    await ReadText(path, TEXT_ABCDEF);
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

describe(Async_NodePlatform_File_Append_Text.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Append_Text(path, TEXT_DEF, true);
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
    await ReadText(path, TEXT_ABCDEF);
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
    await ReadText(path, TEXT_ABCDEF);
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

describe(Async_NodePlatform_File_Delete.name, async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Delete(path);
    expect(value).toBe(expected);
  }

  runner['[01] path is directory and empty'](async (path) => {
    await fn(path, false);
  });
  runner['[02] path is directory and NOT empty'](async (path) => {
    await fn(path, false);
  });
  runner['[03] path is file'](async (path) => {
    await fn(path, true);
  });
  runner['[04] parent path is file'](async (path) => {
    await fn(path, true);
  });
  runner['[05] path does NOT exist and parent path does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[06] path does NOT exist but parent path does exist'](async (path) => {
    await fn(path, true);
  });
  runner['[07] path is junction to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[08] path is symbolic link to directory'](async (path) => {
    await fn(path, false);
  });
  runner['[09] path is symbolic link to file'](async (path) => {
    await fn(path, false);
  });
  runner['[10] path is symbolic link to does NOT exist'](async (path) => {
    await fn(path, true);
  });
  runner['[11] path is recursive symbolic link'](async (path) => {
    await fn(path, true);
  });
  runner['[12] path contains null byte'](async (path) => {
    await fn(path, true);
  });
});

describe(Async_NodePlatform_File_Read_Bytes.name, async () => {
  async function fn(path: string, expected?: Uint8Array) {
    const { value } = await Async_NodePlatform_File_Read_Bytes(path);
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

describe(Async_NodePlatform_File_Read_Text.name, async () => {
  async function fn(path: string, expected?: string) {
    const { value } = await Async_NodePlatform_File_Read_Text(path);
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

describe(Async_NodePlatform_File_Write_Bytes.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Write_Bytes(path, BYTE_DEF, false);
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
    await fn(path, false);
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

describe(Async_NodePlatform_File_Write_Bytes.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Write_Bytes(path, BYTE_DEF, true);
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

describe(Async_NodePlatform_File_Write_Text.name + ' { recursive = false }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Write_Text(path, TEXT_DEF, false);
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
    await fn(path, false);
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

describe(Async_NodePlatform_File_Write_Text.name + ' { recursive = true }', async () => {
  async function fn(path: string, expected: boolean) {
    const { value } = await Async_NodePlatform_File_Write_Text(path, TEXT_DEF, true);
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

/**
 * Shell Cursor API:
 * These are highly experimental, and so I have no tests for them, yet.
 *
 * Shell StdIn API:
 * There's probably a way to test stdin/stdout, but this is a niche API, so I
 * will figure it out some other month.
 */

/**
 * ### ENOENT / ENOTDIR
 *
 * When certain directory API are called on paths that are files, Node/Bun will
 * either throw ENOENT or ENOTDIR depending on the operating system and
 * platform. Over time, I have seen these errors change, making it difficult to
 * rely on the error codes. For that reason, I experimented with wrapping raw
 * Node API errors inside a Class_NodePlatform_Error instance with more
 * consistent error codes. It was a decent idea, but it felt like I was adding
 * to the problem instead of taking away. Eventually, I decided to change most
 * of the API to return an "optional" object with the expected value and a
 * possible error. The user can decide what to do with the information provided
 * by the error.
 *
 * ### EPERM / EEXIST / EISDIR
 *
 * Similar to the problem above, Windows sometimes uses EPERM when attempting a
 * file operation on a directory. The EISDIR code makes more sense here.
 *
 * ### Reserved Names
 *
 * There are some reserved names that Windows will not allow for use as file
 * names. Some examples are NUL, CON, and PRN. File creation with such names
 * will surely fail, but fs.stat will not always throw an error, leaving the
 * user to guess if a file actually exists or not.
 *
 * A list of reserved file names on Windows:
 *
 * - https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file
 *
 * ### Permission Test Cases
 *
 * Would need some complex setup to handle permission cases. Might add those at
 * another time.
 *
 * ### Test Case Errors
 *
 * Due to issues with how errors are handled in asynchronous calls, you cannot
 * rely on the line numbers shown in the error call stacks. Instead, find the
 * specific case via its label. All errors should be thrown inside the test
 * cases.
 */
