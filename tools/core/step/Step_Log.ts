import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_Log(...items: any[]): Builder.Step {
  return new Class(items);
}
class Class implements Builder.Step {
  StepName = Step_Log.name;
  logger = Logger(this.StepName).newChannel();

  constructor(readonly items: any[]) {}
  async onRun(): Promise<void> {
    this.logger.log(...this.items);
  }
}
