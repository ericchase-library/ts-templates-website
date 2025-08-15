import { Step_Dev_Project_Sync_Core } from './core-dev/step/Step_Dev_Project_Sync_Core.js';
import { Builder } from './core/Builder.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';

// This script pulls core lib files from template project.

const template_path = 'C:/Code/Base/JavaScript-TypeScript/Templates/Website';

Builder.SetStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_Dev_Project_Sync_Core({ from_path: template_path, to_path: '.' }),
  //
);

await Builder.Start();
