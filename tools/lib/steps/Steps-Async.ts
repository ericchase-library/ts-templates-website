import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Safe$Step$onCleanUp, Safe$Step$onRun, Safe$Step$onStartUp, Step } from '../Builder.js';

const logger = Logger(Step_Async.name);

export function Step_Async(steps: Step[]): Step {
  return new CStep_Async(steps);
}

class CStep_Async implements Step {
  channel = logger.newChannel();

  constructor(readonly steps: Step[]) {}
  async onStartUp(builder: BuilderInternal): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(Safe$Step$onStartUp(builder, step));
    }
    await Promise.allSettled(tasks);
  }
  async onRun(builder: BuilderInternal): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(Safe$Step$onRun(builder, step));
    }
    await Promise.allSettled(tasks);
  }
  async onCleanUp(builder: BuilderInternal): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(Safe$Step$onCleanUp(builder, step));
    }
    await Promise.allSettled(tasks);
  }
}
