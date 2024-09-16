import { Debouncer } from '../src/lib/ericchase/Algorithm/Debounce.js';
import { Watcher } from '../src/lib/ericchase/Platform/Node/Watch.js';
import { ConsoleError } from '../src/lib/ericchase/Utility/Console.js';
import { server_http } from '../src/server/server.js';
import { buildClear, buildSteps, onLog } from './build.js';

const builder = new Debouncer(async () => {
  await buildSteps(true);
}, 100);

await buildClear();
await builder.run();

// TODO: add a way to toggle hot reloading
try {
  await fetch(server_http);
  ConsoleError('Hot Reloading ONLINE');
  const reloader = new Debouncer(async () => {
    await fetch(`${server_http}/server/reload`);
  }, 200);
  onLog.subscribe(() => {
    reloader.run();
  });
} catch (error) {
  ConsoleError('Hot Reloading OFFLINE. Is server running? (`bun run serve`)');
}

try {
  const watcher_src = new Watcher('./src', 100);
  watcher_src.observe(async () => {
    await builder.run();
  });
  await watcher_src.done;
} catch (error) {
  ConsoleError(error);
}
