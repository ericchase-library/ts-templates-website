import { Builder } from './lib/Builder.js';
import { Step_Bun_Run } from './lib/steps/Bun-Run.js';
import { Step_Project_PullLib } from './lib/steps/Dev-Project-PullLib.js';

// This script pulls base lib files from another project. I use it for quickly
// updating templates and concrete projects.
const builder = new Builder();

builder.setStartupSteps([
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_Project_PullLib('C:/Code/Base/Javascript-Typescript/Project@Template'),
  //
]);

await builder.start();
