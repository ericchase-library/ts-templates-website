import { Debouncer } from '../src/lib/ericchase/Algorithm/Debounce.js';
import { Run } from '../src/lib/ericchase/Platform/Bun/Process.js';
import { Watcher } from '../src/lib/ericchase/Platform/Node/Watch.js';
import { ConsoleError, ConsoleLog } from '../src/lib/ericchase/Utility/Console.js';

const builder = new Debouncer(async () => {
  await Run('bun run build');
}, 250);

builder.run();

try {
  const watcher_src = new Watcher('./src', 250);
  const watcher_tools = new Watcher('./tools', 250);
  ConsoleLog();
  watcher_src.observe(() => {
    console.log('---');
    builder.run();
  });
  watcher_tools.observe(() => {
    console.log('---');
    builder.run();
  });
  await watcher_src.done;
  await watcher_tools.done;
} catch (error) {
  ConsoleError(error);
}
