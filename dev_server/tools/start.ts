import { Run } from '../src/lib/ericchase/Platform/Bun/Child Process.js';
import { ConsoleLog } from '../src/lib/ericchase/Utility/Console.js';

while (true) {
  const server_process = Run.Bun('./src/server.ts');
  await server_process.exited;
  switch (server_process.exitCode) {
    case 1:
      ConsoleLog('Exit Code [1]:Restart');
      break;
    case 2:
      ConsoleLog('Exit Code [2]:Shutdown');
      process.exit(0);
      break;
    default:
      ConsoleLog(`Exit Code [${server_process.exitCode}]`);
      process.stdout.write('Restart? (y/n)');
      for await (const line of console) {
        if (line.trim() === 'y') break;
        process.exit(0);
      }
      break;
  }
  ConsoleLog('\n');
}
