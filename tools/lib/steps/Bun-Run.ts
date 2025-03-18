import { U8StreamReadAll } from 'src/lib/ericchase/Algorithm/Stream.js';
import { U8ToString } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from 'tools/lib/Builder.js';

const logger = Logger(Step_Bun_Run.name);

export function Step_Bun_Run({ cmd, dir }: { cmd: string[]; dir?: CPath | string }, logging?: 'normal' | 'quiet'): Step {
  return new CStep_Bun_Run(cmd, Path(dir ?? process.cwd()).raw, logging ?? 'normal');
}

class CStep_Bun_Run implements Step {
  channel = logger.newChannel();

  constructor(
    readonly cmd: string[],
    readonly dir: string,
    readonly logging?: 'normal' | 'quiet',
  ) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    this.channel.log(`Command: "${this.cmd.join(' ')}" | Directory: "${this.dir}"`);
    const p0 = Bun.spawn(this.cmd, { cwd: this.dir, stderr: 'pipe', stdout: 'pipe' });
    await Promise.allSettled([p0.exited]);
    if (this.logging === 'normal') {
      this.channel.errorNotEmpty(BunRunErrorCleaner(U8ToString(await U8StreamReadAll(p0.stderr))));
      this.channel.logNotEmpty(U8ToString(await U8StreamReadAll(p0.stdout)));
    }
  }
}

export function BunRunErrorCleaner(error: string): string {
  if (error.startsWith('$')) {
    return error.slice(error.indexOf('\n') + 1).trim();
  }
  return error;
}
