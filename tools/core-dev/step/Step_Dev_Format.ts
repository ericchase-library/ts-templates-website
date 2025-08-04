import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Step_Bun_Run } from '../../core/step/Step_Bun_Run.js';

/**
 * @defaults
 * @param config.showlogs `true`;
 */
export function Step_Dev_Format(config?: Config): Builder.Step {
  return new Class(config ?? {});
}
class Class implements Builder.Step {
  StepName = Step_Dev_Format.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {
    this.config.showlogs ??= true;
  }
  async onRun(): Promise<void> {
    // await Step_Bun_Run({ cmd: ['bunx', 'biome', 'format', '--verbose', '--write'], showlogs: this.config.showlogs }).onRun?.();
    await Step_Bun_Run({ cmd: ['bunx', 'prettier', '--write', '.'], showlogs: this.config.showlogs }).onRun?.();
  }
}
interface Config {
  showlogs?: boolean;
}
