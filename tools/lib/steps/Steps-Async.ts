import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_Async.name);

export function Step_Async(steps: Step[]): Step {
  return new CStep_Async(steps);
}

class CStep_Async implements Step {
  channel = logger.newChannel();

  constructor(readonly steps: Step[]) {}
  async end(builder: BuilderInternal) {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(this.safe$step$end(builder, step));
    }
    await Promise.allSettled(tasks);
  }
  async run(builder: BuilderInternal) {
    const tasks: Promise<void>[] = [];
    for (const step of this.steps) {
      tasks.push(this.safe$step$run(builder, step));
    }
    await Promise.allSettled(tasks);
  }

  async safe$step$end(builder: BuilderInternal, step: Step) {
    try {
      await step.end(builder);
    } catch (error) {
      this.channel.error(`Unhandled exception in ${step.constructor.name}.end:`, error);
    }
  }
  async safe$step$run(builder: BuilderInternal, step: Step) {
    try {
      await step.run(builder);
    } catch (error) {
      this.channel.error(`Unhandled exception in ${step.constructor.name}.run:`, error);
    }
  }
}
