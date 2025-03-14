import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';

export function Step_Async(steps: BuildStep[]): BuildStep {
  return new CStep_Async(steps);
}

class CStep_Async implements BuildStep {
  constructor(readonly steps: BuildStep[]) {}
  async run(builder: BuilderInternal) {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(step.run(builder));
    }
    for (const task of tasks) {
      await task;
    }
  }
}
