import type { Subprocess } from 'bun';
import { ConsoleLog } from '../src/lib/Console.js';

Bun.spawnSync(['bun', 'install']);

let proc: Subprocess<'ignore', 'inherit', 'inherit'> | undefined = undefined;
while (true) {
  proc = Bun.spawn(['bun', './src/server.ts'], { stdout: 'inherit' });
  await proc.exited;
  switch (proc.exitCode) {
    case 1:
      ConsoleLog('Exit Code [1]:Restart');
      break;
    case 2:
      ConsoleLog('Exit Code [2]:Shutdown');
      process.exit(0);
    default:
      ConsoleLog(`Exit Code [${proc.exitCode}]`);
      process.stdout.write('Restart? (y/n)');
      for await (const line of console) {
        if (line.trim() === 'y') break;
        process.exit(0);
      }
      break;
  }
  ConsoleLog('\n');
}
