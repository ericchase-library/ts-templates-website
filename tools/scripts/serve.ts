import { command_map } from '../dev.js';
import { TryLock } from '../lib/cache/LockCache.js';

TryLock(command_map.serve);

await Bun.spawn(['bun', 'run', './tools/dev.ts'], { cwd: './dev_server/', stdout: 'inherit', stderr: 'inherit' }).exited;
