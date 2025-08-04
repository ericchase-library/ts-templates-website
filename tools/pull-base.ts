import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Sync_Config } from './core-dev/step/Step_Dev_Project_Sync_Config.js';
import { Step_Dev_Project_Sync_Lib } from './core-dev/step/Step_Dev_Project_Sync_Lib.js';
import { Builder } from './core/Builder.js';
import { Processor_Set_Writable } from './core/processor/Processor_Set_Writable.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';

// This script pulls base lib files from another project. I use it for quickly
// updating templates and concrete projects.

Builder.SetStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_Dev_Project_Sync_Lib({ from_path: 'C:/Code/Base/JavaScript-TypeScript/@Template', to_path: './' }),
  Step_Dev_Project_Sync_Config({ project_path: './' }),
  Step_Dev_Format({ showlogs: false }),
  //
);

Builder.SetProcessorModules(
  Processor_Set_Writable({ exclude_patterns: ['**/*'] }),
  //
);

await Builder.Start();
