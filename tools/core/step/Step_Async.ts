import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_Async(steps: Builder.Step[]): Builder.Step {
  return new Class(steps);
}
class Class implements Builder.Step {
  StepName = Step_Async.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly steps: Builder.Step[]) {}
  async onStartUp(): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      if (step.onStartUp) {
        tasks.push(step.onStartUp());
      }
    }
    await Promise.allSettled(tasks);
  }
  async onRun(): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      if (step.onRun) {
        tasks.push(step.onRun());
      }
    }
    await Promise.allSettled(tasks);
  }
  async onCleanUp(): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      if (step.onCleanUp) {
        tasks.push(step.onCleanUp());
      }
    }
    await Promise.allSettled(tasks);
  }
}
