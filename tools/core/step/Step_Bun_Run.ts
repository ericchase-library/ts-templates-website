import { Core_Array_Uint8_ToString, Core_Stream_Uint8_Async_ReadAll } from '../../../src/lib/ericchase/api.core.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_Bun_Run(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_Bun_Run.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {
    this.config.dir ??= process.cwd();
    this.config.showlogs ??= true;
    this.config.stdin ??= 'ignore';
  }
  async onRun(): Promise<void> {
    try {
      const p0 = Bun.spawn(this.config.cmd, { cwd: this.config.dir, stdin: this.config.stdin, stderr: 'pipe', stdout: 'pipe' });
      this.channel.log(`Run: "${this.config.cmd.join(' ')}" | Directory: "${this.config.dir}"`);
      await p0.exited;
      if (this.config.showlogs === true) {
        this.channel.errorNotEmpty(Core_Array_Uint8_ToString(await Core_Stream_Uint8_Async_ReadAll(p0.stderr)));
        this.channel.logNotEmpty(Core_Array_Uint8_ToString(await Core_Stream_Uint8_Async_ReadAll(p0.stdout)));
      }
      this.channel.log(`End: "${this.config.cmd.join(' ')}" | Directory: "${this.config.dir}"`);
    } catch (error) {
      this.channel.error(`Command: "${this.config.cmd.join(' ')}" | Directory: "${this.config.dir}"`, error);
    }
  }
}
interface Config {
  cmd: string[];
  dir?: string;
  showlogs?: boolean;
  stdin?: SpawnOptions['stdin'];
}
type SpawnOptions = NonNullable<Parameters<typeof Bun.spawn>[1]>;
