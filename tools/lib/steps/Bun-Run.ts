import { U8StreamReadAll } from '../../../src/lib/ericchase/Algorithm/Stream.js';
import { U8ToString } from '../../../src/lib/ericchase/Algorithm/Uint8Array.js';
import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_Bun_Run.name);

type SpawnOptions = NonNullable<Parameters<typeof Bun.spawn>[1]>;

export function Step_Bun_Run({ cmd, dir, stdin }: { cmd: string[]; dir?: CPath | string; stdin?: SpawnOptions['stdin'] }, logging?: 'normal' | 'quiet'): Step {
  return new CStep_Bun_Run(cmd, Path(dir ?? process.cwd()).raw, stdin ?? 'ignore', logging ?? 'normal');
}

class CStep_Bun_Run implements Step {
  channel = logger.newChannel();

  constructor(
    readonly cmd: string[],
    readonly dir: string,
    readonly stdin: SpawnOptions['stdin'],
    readonly logging?: 'normal' | 'quiet',
  ) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    try {
      const p0 = Bun.spawn(this.cmd, { cwd: this.dir, stdin: this.stdin, stderr: 'pipe', stdout: 'pipe' });
      this.channel.log(`Run: Command: "${this.cmd.join(' ')}" | Directory: "${this.dir}"`);
      await p0.exited;
      if (this.logging === 'normal') {
        this.channel.log(`Exited: Command: "${this.cmd.join(' ')}" | Directory: "${this.dir}"`);
        this.channel.errorNotEmpty(U8ToString(await U8StreamReadAll(p0.stderr)));
        this.channel.logNotEmpty(U8ToString(await U8StreamReadAll(p0.stdout)));
      }
    } catch (error) {
      this.channel.error(`Command: "${this.cmd.join(' ')}" | Directory: "${this.dir}"`, error);
    }
  }
}
