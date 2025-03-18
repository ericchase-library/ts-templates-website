import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from 'tools/lib/Builder.js';
import { Step_Bun_Run } from 'tools/lib/steps/Bun-Run.js';

const logger = Logger(Step_Format.name);

export function Step_Format(logging?: 'normal' | 'quiet'): Step {
  return new CStep_Format(logging ?? 'normal');
}

class CStep_Format implements Step {
  channel = logger.newChannel();

  constructor(readonly logging: 'normal' | 'quiet') {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    this.channel.log('Format');
    await Step_Bun_Run({ cmd: ['biome', 'format', '--files-ignore-unknown', 'true', '--verbose', '--write'] }, this.logging).run(builder);
    await Step_Bun_Run({ cmd: ['prettier', '--write', '.'] }, this.logging).run(builder);
  }
}
