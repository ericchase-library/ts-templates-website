import { BuilderInternal, Step } from '../Builder.js';

export function Step_Sync(steps: Step[]): Step {
  return new CStep_Sync(steps);
}

class CStep_Sync implements Step {
  constructor(readonly steps: Step[]) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    for (const step of this.steps) {
      await step.run(builder);
    }
  }
}
