import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Sync_Core } from './core-dev/step/Step_Dev_Project_Sync_Core.js';
import { Step_Dev_Project_Update_Config } from './core-dev/step/Step_Dev_Project_Update_Config.js';
import { Builder } from './core/Builder.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';

// This script pulls core lib files from another project. I use it for quickly
// updating templates and concrete projects.

Builder.SetStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_Dev_Project_Sync_Core({ from_path: 'C:/Code/Base/JavaScript-TypeScript/Templates/Website', to_path: './' }),
  Step_Dev_Project_Update_Config({ project_path: './' }),
  Step_Dev_Format({ showlogs: false }),
  //
);

await Builder.Start();
