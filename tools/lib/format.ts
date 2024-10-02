import { RunSync } from '../../src/lib/ericchase/Platform/Bun/Child Process.js';
import { command_map } from '../dev.js';
import { Cache_FileStats_Lock, Cache_FileStats_Unlock } from './cache/FileStatsCache.js';
import { TryLock } from './cache/LockCache.js';

TryLock(command_map.format);

const Biome = ['biome', 'format', '--files-ignore-unknown', 'true'];
const Prettier = ['prettier', './**/*.{html,md}'];

if (Cache_FileStats_Lock()) {
  switch (Bun.argv[2]) {
    case 'debug':
    case '--debug': {
      RunSync.Bun(...Biome, '--verbose'); //                                     shows which files *would* be formatted (dry-run)
      RunSync.Bun(...Prettier, '--debug-check');
      break;
    }
    case 'silent':
    case '--silent': {
      RunSync.Bun.Quiet(...Biome, '--write'); //                                 doesn't show any output
      RunSync.Bun.Quiet(...Prettier, '--log-level', 'silent', '--write');
      break;
    }
    default: {
      RunSync.Bun(...Biome, '--verbose', '--write'); //                          biome doesn't properly show which files were changed with --verbose
      RunSync.Bun(...Prettier, '--write');
      break;
    }
  }
  Cache_FileStats_Unlock();
}
