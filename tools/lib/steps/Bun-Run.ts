import { U8ToString } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Step } from 'tools/lib/Step.js';

const logger = Logger(__filename, Step_Bun_Run.name);

export function Step_Bun_Run({ cmd, dir }: { cmd: string[]; dir?: CPath | string }, logging?: 'quiet'): Step {
  return new CStep_Bun_Run(cmd, dir, logging ?? 'normal');
}

class CStep_Bun_Run implements Step {
  dir?: string;
  logger = logger.newChannel();
  constructor(
    readonly cmd: string[],
    dir?: CPath | string,
    readonly logging?: 'normal' | 'quiet',
  ) {
    if (dir) {
      this.dir = Path(dir).raw;
    }
  }
  async run(builder: BuilderInternal) {
    this.logger.logWithDate();
    this.logger.log(`> ${this.cmd.join(' ')} (${this.dir ?? './'})`);
    const p0 = Bun.spawnSync(this.cmd, { cwd: this.dir, stderr: 'pipe', stdout: 'pipe' });
    if (this.logging === 'normal') {
      this.logger.logNotEmpty(U8ToString(p0.stdout));
      this.logger.errorNotEmpty(U8ToString(p0.stderr));
    }
  }
}
