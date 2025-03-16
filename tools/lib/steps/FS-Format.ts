import { U8StreamReadAll } from 'src/lib/ericchase/Algorithm/Stream.js';
import { U8ToString } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Step } from 'tools/lib/Step.js';

const logger = Logger(__filename, Step_Format.name);

export function Step_Format(logging?: 'quiet'): Step {
  return new CStep_Format(logging ?? 'normal');
}

class CStep_Format implements Step {
  logger = logger.newChannel();

  constructor(readonly logging: 'normal' | 'quiet') {}
  async run(builder: BuilderInternal) {
    this.logger.logWithDate();
    const p0 = Bun.spawn(['biome', 'format', '--files-ignore-unknown', 'true', '--verbose', '--write'], { stderr: 'pipe', stdout: 'pipe' });
    const p1 = Bun.spawn(['prettier', '.', '--write'], { stderr: 'pipe', stdout: 'pipe' });
    await Promise.allSettled([p0.exited, p1.exited]);
    if (this.logging === 'normal') {
      this.logger.log('> BIOME');
      this.logger.logNotEmpty(U8ToString(await U8StreamReadAll(p0.stdout)));
      this.logger.errorNotEmpty(U8ToString(await U8StreamReadAll(p0.stderr)));
      this.logger.log('> PRETTIER');
      this.logger.logNotEmpty(U8ToString(await U8StreamReadAll(p1.stdout)));
      this.logger.errorNotEmpty(U8ToString(await U8StreamReadAll(p1.stderr)));
    }
  }
}
