import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_Sync(steps: Builder.Step[]): Builder.Step {
  return new Class(steps);
}
class Class implements Builder.Step {
  StepName = Step_Sync.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly steps: Builder.Step[]) {}
  async onStartUp(): Promise<void> {
    for (const step of this.steps) {
      await step.onStartUp?.();
    }
  }
  async onRun(): Promise<void> {
    for (const step of this.steps) {
      await step.onRun?.();
    }
  }
  async onCleanUp(): Promise<void> {
    for (const step of this.steps) {
      await step.onCleanUp?.();
    }
  }
}
