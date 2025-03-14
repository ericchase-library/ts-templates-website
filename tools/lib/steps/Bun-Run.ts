import { U8ToString } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { ConsoleErrorNotEmpty, ConsoleLog, ConsoleLogNotEmpty, ConsoleLogWithDate } from 'src/lib/ericchase/Utility/Console.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';

export function Step_Bun_Run({ cmd, dir }: { cmd: string[]; dir?: CPath | string }, logging?: 'quiet'): BuildStep {
  return new CStep_Bun_Run(cmd, dir, logging ?? 'normal');
}

class CStep_Bun_Run implements BuildStep {
  dir?: string;
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
    ConsoleLogWithDate(this.constructor.name);
    ConsoleLog(`> ${this.cmd.join(' ')} (${this.dir ?? './'})`);
    const p0 = Bun.spawnSync(this.cmd, { cwd: this.dir, stderr: 'pipe', stdout: 'pipe' });
    if (this.logging === 'normal') {
      ConsoleLogNotEmpty(U8ToString(p0.stdout));
      ConsoleErrorNotEmpty(U8ToString(p0.stderr));
    }
  }
}
