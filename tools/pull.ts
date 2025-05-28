import { Builder } from './core/Builder.js';
import { Processor_Set_Writable } from './core/processor/Processor_Set_Writable.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';
import { Step_Dev_Project_Sync_Lib } from './lib-dev/step/Step_Dev_Project_Sync_Lib.js';

// This script pulls base lib files from another project. I use it for quickly
// updating templates and concrete projects.

Builder.SetStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_Dev_Project_Sync_Lib({ from: 'C:/Code/Base/JavaScript-TypeScript/@Template', to: './' }),
  //
);

Builder.SetProcessorModules(
  Processor_Set_Writable({ exclude_patterns: ['**/*'] }),
  //
);

await Builder.Start();
