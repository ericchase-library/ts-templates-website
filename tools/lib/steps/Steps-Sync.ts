import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Step } from 'tools/lib/Step.js';

export function Step_Sync(steps: Step[]): Step {
  return new CStep_Sync(steps);
}

class CStep_Sync implements Step {
  constructor(readonly steps: Step[]) {}
  async run(builder: BuilderInternal) {
    for (const step of this.steps) {
      await step.run(builder);
    }
  }
}
