import { Builder } from 'tools/lib/Builder.js';
import { Step_Bun_Run } from 'tools/lib/steps/Bun-Run.js';
import { Step_Project_PullLib } from 'tools/lib/steps/Dev-Project-PullLib.js';

const builder = new Builder();

builder.setStartupSteps([
  Step_Bun_Run({ cmd: ['bun', 'install'] }),
  Step_Project_PullLib('C:/Code/Base/Javascript-Typescript/Project@Library'),
  //
]);

await builder.start();
