import { server_hostname, server_port } from '../../src/dev_server/server-data.js';
import { Path } from '../../src/lib/ericchase/Platform/Node/Path.js';
import { StdinRawModeReader } from '../../src/lib/ericchase/Platform/Node/Process.js';
import { KEYS } from '../../src/lib/ericchase/Platform/Node/Shell.js';
import { Watcher } from '../../src/lib/ericchase/Platform/Node/Watch.js';
import { ConsoleError } from '../../src/lib/ericchase/Utility/Console.js';
import { command_map } from '../dev.js';
import { TryLock } from '../lib/cache/LockCache.js';

const stdin = new StdinRawModeReader();
// CLI: Force Quit Server
stdin.addHandler(async (text) => {
  if (text === KEYS.SIGINT) {
    await stdin.stop();
    server_process?.stdin.write(`${KEYS.SIGINT}`);
    await Bun.sleep(25);
    server_process?.kill();
    await server_process?.exited;
    process.exit();
  }
});
stdin.start();

TryLock(command_map.serve);

await Bun.spawn(['bun', 'update'], { cwd: './dev_server/', stdin: 'inherit', stdout: 'inherit' }).exited;

function run_server() {
  return Bun.spawn(['bun', './tools/start'], {
    cwd: './dev_server/',
    env: {
      HOSTNAME: server_hostname,
      PORT: server_port,
    },
    stdin: 'pipe',
    stdout: 'inherit',
  });
}

let server_process = run_server();

const watcher_server = new Watcher(new Path('./dev_server/'), 100);
watcher_server.observe(async (events) => {
  try {
    if (server_process) {
      server_process.kill();
      await server_process.exited;
      server_process = run_server();
    }
  } catch (error) {
    ConsoleError(error);
  }
});
