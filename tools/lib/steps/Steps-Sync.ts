import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Safe$Step$onCleanUp, Safe$Step$onRun, Safe$Step$onStartUp, Step } from '../Builder.js';

const logger = Logger(Step_Sync.name);

export function Step_Sync(steps: Step[]): Step {
  return new CStep_Sync(steps);
}

class CStep_Sync implements Step {
  channel = logger.newChannel();

  constructor(readonly steps: Step[]) {}
  async onStartUp(builder: BuilderInternal): Promise<void> {
    for (const step of this.steps) {
      await Safe$Step$onStartUp(builder, step);
    }
  }
  async onRun(builder: BuilderInternal): Promise<void> {
    for (const step of this.steps) {
      await Safe$Step$onRun(builder, step);
    }
  }
  async onCleanUp(builder: BuilderInternal): Promise<void> {
    for (const step of this.steps) {
      await Safe$Step$onCleanUp(builder, step);
    }
  }
}
