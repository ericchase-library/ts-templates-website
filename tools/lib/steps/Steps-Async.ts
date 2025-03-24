import { BuilderInternal, Step } from '../Builder.js';

export function Step_Async(steps: Step[]): Step {
  return new CStep_Async(steps);
}

class CStep_Async implements Step {
  constructor(readonly steps: Step[]) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(step.run(builder));
    }
    await Promise.all(tasks);
  }
}
