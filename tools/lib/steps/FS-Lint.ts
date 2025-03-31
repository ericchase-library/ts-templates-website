import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';
import { Step_Bun_Run } from './Bun-Run.js';

const logger = Logger(Step_Lint.name);

export function Step_Lint(logging?: 'normal' | 'quiet'): Step {
  return new CStep_Lint(logging ?? 'normal');
}

class CStep_Lint implements Step {
  channel = logger.newChannel();

  constructor(readonly logging: 'normal' | 'quiet') {}
  async onRun(builder: BuilderInternal): Promise<void> {
    this.channel.log('Lint');
    await Step_Bun_Run({ cmd: ['biome', 'lint', '--error-on-warnings', '--write'] }, this.logging).onRun?.(builder);
  }
}
