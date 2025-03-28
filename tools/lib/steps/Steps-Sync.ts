import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_Sync.name);

export function Step_Sync(steps: Step[]): Step {
  return new CStep_Sync(steps);
}

class CStep_Sync implements Step {
  channel = logger.newChannel();

  constructor(readonly steps: Step[]) {}
  async end(builder: BuilderInternal) {
    for (const step of this.steps) {
      await this.safe$step$end(builder, step);
    }
  }
  async run(builder: BuilderInternal) {
    for (const step of this.steps) {
      await this.safe$step$run(builder, step);
    }
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
