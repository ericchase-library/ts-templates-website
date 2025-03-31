import { Path } from '../src/lib/ericchase/Platform/FilePath.js';
import { Builder } from './lib/Builder.js';
import { Step_Bun_Run } from './lib/steps/Bun-Run.js';
import { Step_Project_PullLib } from './lib/steps/Dev-Project-PullLib.js';
import { Step_MirrorDirectory } from './lib/steps/FS-MirrorDirectory.js';

// This script pulls base lib files from another project. I use it for quickly
// updating templates and concrete projects.
const builder = new Builder();

builder.setStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_Project_PullLib('C:/Code/Base/JavaScript-TypeScript/@Template'),
  // pull updates for server
  Step_MirrorDirectory({
    from: Path('C:/Code/Base/JavaScript-TypeScript/@Library', 'server'),
    to: Path('server'),
    include_patterns: ['**/*'],
    exclude_patterns: ['{.git,node_modules,public}/**/*', 'bun.lock'],
  }),
  //
);

await builder.start();
