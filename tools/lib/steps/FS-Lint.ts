import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from 'tools/lib/Builder.js';
import { Step_Bun_Run } from 'tools/lib/steps/Bun-Run.js';

const logger = Logger(Step_Lint.name);

export function Step_Lint(logging?: 'normal' | 'quiet'): Step {
  return new CStep_Lint(logging ?? 'normal');
}

class CStep_Lint implements Step {
  logger = logger.newChannel();

  constructor(readonly logging: 'normal' | 'quiet') {}
  async run(builder: BuilderInternal) {
    this.logger.log('Lint');
    await Step_Bun_Run({ cmd: ['biome', 'lint', '--error-on-warnings', '--write'] }, this.logging).run(builder);
  }
}
