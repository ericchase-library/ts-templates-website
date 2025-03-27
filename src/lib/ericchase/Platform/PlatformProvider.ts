import { default as node_fs } from 'node:fs';
import { SplitLines } from '../Utility/String.js';
import { CPath, Path } from './FilePath.js';

export type FileData = string | ArrayBufferLike | Blob | NodeJS.TypedArray<ArrayBufferLike>;
export type FileStats = node_fs.Stats;
export type WatchCallback = (event: 'rename' | 'change', path: CPath) => void;

export class CPlatformProvider {
  Directory = {
    create: (path: CPath, recursive = true): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    delete: (path: CPath, recursive = true): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    globScan: (path: CPath, pattern: string, absolutepaths = false, onlyfiles = true): AsyncIterableIterator<string> => {
      throw new Error('Not Implemented');
    },
    watch: (path: CPath, callback: WatchCallback, recursive = true): (() => void) => {
      throw new Error('Not Implemented');
    },
  };
  File = {
    appendBytes: (path: CPath, bytes: Uint8Array): Promise<void> => {
      throw new Error('Not Implemented');
    },
    appendText: (path: CPath, text: string): Promise<void> => {
      throw new Error('Not Implemented');
    },
    compare: (from: CPath, to: CPath): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    copy: (from: CPath, to: CPath, overwrite = false): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    delete: (path: CPath): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    move: (from: CPath, to: CPath, overwrite = false): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    readBytes: (path: CPath): Promise<Uint8Array> => {
      throw new Error('Not Implemented');
    },
    readText: (path: CPath): Promise<string> => {
      throw new Error('Not Implemented');
    },
    writeBytes: (path: CPath, bytes: Uint8Array, createpath = true): Promise<number> => {
      throw new Error('Not Implemented');
    },
    writeText: (path: CPath, text: string, createpath = true): Promise<number> => {
      throw new Error('Not Implemented');
    },
  };
  Path = {
    getStats: (path: CPath): Promise<FileStats> => {
      throw new Error('Not Implemented');
    },
    isDirectory: (path: CPath): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    isFile: (path: CPath): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
    isSymbolicLink: (path: CPath): Promise<boolean> => {
      throw new Error('Not Implemented');
    },
  };
  Utility = {
    globMatch: (query: string, pattern: string): boolean => {
      throw new Error('Not Implemented');
    },
  };
}

export const UnimplementedProvider = new CPlatformProvider();

// Creates a descendent of UnimplementedProvider, and then creates descendents
// of each property of UnimplementedProvider.
export function PlatformProvider(): CPlatformProvider {
  const provider: CPlatformProvider = Object.create(UnimplementedProvider);
  provider.Directory = Object.create(UnimplementedProvider.Directory);
  provider.File = Object.create(UnimplementedProvider.File);
  provider.Utility = Object.create(UnimplementedProvider.Utility);
  return provider;
}

function cleanStack(stack = '') {
  const lines = SplitLines(stack ?? '');
  if (lines[0].trim() === 'Error') {
    lines[0] = 'Fixed Call Stack:';
  }
  return lines.join('\n');
}

async function callAsync<T>(stack: string | undefined, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (async_error: any) {
    if (typeof async_error === 'object') {
      throw new Error(`${async_error.message}\n${cleanStack(stack ?? '')}`);
    }
    throw new Error(`${async_error}\n${cleanStack(stack ?? '')}`);
  }
}

class CPlatformProviderErrorWrapper extends CPlatformProvider {
  constructor(public provider: CPlatformProvider) {
    super();
  }
  Directory = {
    create: (path: CPath, recursive = true): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.Directory.create(path, recursive));
    },
    delete: (path: CPath, recursive = true): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.Directory.delete(path, recursive));
    },
    globScan: (path: CPath, pattern: string, absolutepaths = false, onlyfiles = true): AsyncIterableIterator<string> => {
      return this.provider.Directory.globScan(path, pattern, absolutepaths, onlyfiles);
    },
    watch: (path: CPath, callback: WatchCallback, recursive = true): (() => void) => {
      return this.provider.Directory.watch(path, callback, recursive);
    },
  };
  File = {
    appendBytes: (path: CPath, bytes: Uint8Array): Promise<void> => {
      return callAsync(Error().stack, this.provider.File.appendBytes(path, bytes));
    },
    appendText: (path: CPath, text: string): Promise<void> => {
      return callAsync(Error().stack, this.provider.File.appendText(path, text));
    },
    compare: (from: CPath, to: CPath): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.File.compare(from, to));
    },
    copy: (from: CPath, to: CPath, overwrite = false): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.File.copy(from, to, overwrite));
    },
    delete: (path: CPath): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.File.delete(path));
    },
    move: (from: CPath, to: CPath, overwrite = false): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.File.move(from, to, overwrite));
    },
    readBytes: (path: CPath): Promise<Uint8Array> => {
      return callAsync(Error().stack, this.provider.File.readBytes(path));
    },
    readText: (path: CPath): Promise<string> => {
      return callAsync(Error().stack, this.provider.File.readText(path));
    },
    writeBytes: (path: CPath, bytes: Uint8Array, createpath = true): Promise<number> => {
      return callAsync(Error().stack, this.provider.File.writeBytes(path, bytes, createpath));
    },
    writeText: (path: CPath, text: string, createpath = true): Promise<number> => {
      return callAsync(Error().stack, this.provider.File.writeText(path, text, createpath));
    },
  };
  Path = {
    getStats: (path: CPath): Promise<FileStats> => {
      return callAsync(Error().stack, this.provider.Path.getStats(path));
    },
    isDirectory: (path: CPath): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.Path.isDirectory(path));
    },
    isFile: (path: CPath): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.Path.isFile(path));
    },
    isSymbolicLink: (path: CPath): Promise<boolean> => {
      return callAsync(Error().stack, this.provider.Path.isSymbolicLink(path));
    },
  };
  Utility = {
    globMatch: (query: string, pattern: string): boolean => {
      return this.provider.Utility.globMatch(query, pattern);
    },
  };
}

export type PlatformProviderId = 'bun' | 'node';
const modulemap: Record<PlatformProviderId, string> = {
  'bun': 'BunProvider.js',
  'node': 'NodeProvider.js',
};

const $cache = new Map<PlatformProviderId, CPlatformProvider>();
export async function getPlatformProvider(id: PlatformProviderId): Promise<CPlatformProvider> {
  if ($cache.has(id) === false) {
    const path = Path(__dirname, 'PlatformProviders', modulemap[id]).raw;
    try {
      $cache.set(id, new CPlatformProviderErrorWrapper((await import(path)).default));
    } catch (error) {
      throw new Error(`Runtime "${id}" @ "${path}" threw: ${error}`);
    }
  }
  return $cache.get(id) ?? UnimplementedProvider;
}
