import { Builder } from '../Builder.js';
import { Step_Bun_Run } from '../steps/Bun-Run.js';
import { Step_Project_PullLib } from '../steps/Dev-Project-PullLib.js';

const builder = new Builder();

// This script pulls base lib files from another project. I use it for quickly
// updating templates and concrete projects.

builder.setStartupSteps([
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_Project_PullLib('C:/Code/Base/Javascript-Typescript/Project@Library'),
  //
]);

await builder.start();
