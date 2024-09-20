import { Debouncer } from '../src/lib/ericchase/Algorithm/Debounce.js';
import { Watcher } from '../src/lib/ericchase/Platform/Node/Watch.js';
import { ConsoleError } from '../src/lib/ericchase/Utility/Console.js';
import { buildStep_Bundle, buildStep_Clean, buildStep_Copy, buildStep_ProcessHTMLFiles } from './build.js';
import { HotReloader } from './lib/Feature_HotReload.js';

process.stdin.setRawMode(true); // Enable raw mode (capture keypresses one at a time)
process.stdin.resume(); // Start reading input from stdin
process.stdin.setEncoding('utf8'); // Set encoding to UTF-8

const CTRL_C = '\u0003';
const UP = '\x1b\x5b\x41';
const DOWN = '\x1b\x5b\x42';
const LEFT = '\x1b\x5b\x44';
const RIGHT = '\x1b\x5b\x43';

try {
  await buildStep_Clean();

  const build = new Debouncer(async () => {
    await buildStep_Bundle(true);
    await buildStep_ProcessHTMLFiles(true);
    await buildStep_Copy();
  }, 100);
  await build.run();

  const hotreloader = new HotReloader(100);
  hotreloader.enable();

  const watcher_src = new Watcher('./src', 100);
  watcher_src.observe(async () => {
    await build.run();
  });

  const onData = async (buf: string) => {
    switch (buf) {
      case CTRL_C:
        process.exit();
        break;
      case 'h':
        hotreloader.toggle();
        break;
      case 'r':
        await buildStep_Clean();
        await build.run();
        ConsoleError('Full Rebuild');
        hotreloader.enable();
        break;
      // case UP:
      //   console.log('up');
      //   break;
      // case DOWN:
      //   console.log('down');
      //   break;
      // case LEFT:
      //   console.log('left');
      //   break;
      // case RIGHT:
      //   console.log('right');
      //   break;
    }
  };
  process.stdin.addListener('data', onData);

  await watcher_src.done;
} catch (error) {
  ConsoleError(error);
}
