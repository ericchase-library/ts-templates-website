import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Sync_Server } from './core-dev/step/Step_Dev_Project_Sync_Server.js';
import { Builder } from './core/Builder.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';

// This script pulls the server folder from another project.

Builder.SetStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_Dev_Project_Sync_Server({ from_path: 'C:/Code/Base/JavaScript-TypeScript/Templates/Website', to_path: './' }),
  Step_Dev_Format({ showlogs: false }),
  //
);

await Builder.Start();
