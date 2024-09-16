import { Run, RunQuiet } from '../src/lib/ericchase/Platform/Bun/Process.js';

const biome_cmd = 'bun biome format --files-ignore-unknown true .';
const prettier_cmd = 'bun prettier ./**/*.{html,md}';

switch (Bun.argv[2]) {
  case 'debug':
  case '--debug': {
    // shows which files *would* be formatted
    await Run(`${biome_cmd} --verbose`);
    await Run(`${prettier_cmd} --debug-check`);
    break;
  }
  case 'silent':
  case '--silent': {
    // doesn't show any output
    await RunQuiet(`${biome_cmd} --write`);
    await RunQuiet(`${prettier_cmd} --log-level silent --write`);
    break;
  }
  default: {
    // biome doesn't properly show which files were changed with --verbose
    await Run(`${biome_cmd} --verbose --write`);
    await Run(`${prettier_cmd} --write`);
    break;
  }
}
