import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Step_Bun_Run } from '../../core/step/Step_Bun_Run.js';

export function Step_Dev_Format(config?: Config): Builder.Step {
  return new Class(config ?? {});
}
class Class implements Builder.Step {
  StepName = Step_Dev_Format.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.config.showlogs ??= true;
  }
  async onRun(): Promise<void> {
    await Builder.ExecuteStep(Step_Bun_Run({ cmd: ['bunx', 'prettier', '--write', '.'], showlogs: this.config.showlogs }));
  }
}
interface Config {
  /** @default true */
  showlogs?: boolean;
}
