import { server_http } from '../../src/dev_server/server-data.js';
import { StdinTextReader } from '../../src/lib/ericchase/Platform/Node/Process.js';
import { KEYS } from '../../src/lib/ericchase/Platform/Node/Shell.js';
import { Watcher } from '../../src/lib/ericchase/Platform/Node/Watch.js';
import { ConsoleError } from '../../src/lib/ericchase/Utility/Console.js';
import { Debounce } from '../../src/lib/ericchase/Utility/Debounce.js';
import { command_map } from '../dev.js';
import { TryLockEach } from '../lib/cache/LockCache.js';
import { HotReloader } from '../lib/hotreload.js';
import { build_mode, buildStep_Clean, buildStep_Copy, buildStep_ProcessHTMLFiles, buildStep_Rename, buildStep_SetupBundler, src_dir } from './build.js';

TryLockEach([command_map.build, command_map.format, command_map.watch]);

const stdin = new StdinTextReader();
stdin.addHandler((text) => {
  if (text.startsWith(KEYS.SIGINT)) {
    process.exit();
  }
});
await stdin.start();

build_mode.watch = true;

const hotreloader = new HotReloader(`${server_http}/server/reload`);
hotreloader.enable();

const build = Debounce(async () => {
  await buildStep_SetupBundler();
  await buildStep_ProcessHTMLFiles();
}, 100);

const copy = Debounce(async () => {
  await buildStep_Copy();
  await buildStep_Rename();
}, 100);

try {
  await buildStep_Clean();
  await build();
  await copy();
} catch (error) {
  ConsoleError(error);
}

const watcher_src = new Watcher(src_dir, 100);
watcher_src.observe(async () => {
  try {
    await build();
    await copy();
  } catch (error) {
    ConsoleError(error);
  }
});

// const watcher_tmp = new Watcher(tmp_dir.path, 100);
// watcher_tmp.observe(async () => {
//   try {
//     await copy();
//   } catch (error) {
//     ConsoleError(error);
//   }
// });

stdin.addHandler((text) => {
  if (text.startsWith('h')) {
    hotreloader.toggle();
  }
});

await watcher_src.done;
// await watcher_tmp.done;
