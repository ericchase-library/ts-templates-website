import { Core_Array_Uint8_To_String } from '../../../src/lib/ericchase/Core_Array_Uint8_To_String.js';
import { Async_Core_Stream_Uint8_Read_All } from '../../../src/lib/ericchase/Core_Stream_Uint8_Read_All.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_Bun_Run(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_Bun_Run.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.config.dir ??= process.cwd();
    this.config.showlogs ??= true;
    this.config.stdin ??= 'ignore';
  }
  async onRun(): Promise<void> {
    try {
      const p0 = Bun.spawn(this.config.cmd, {
        cwd: this.config.dir,
        stdin: this.config.stdin,
        stderr: 'pipe',
        stdout: 'pipe',
      });
      this.channel.log(`Run: "${this.config.cmd.join(' ')}" | Directory: "${this.config.dir}"`);
      await p0.exited;
      if (this.config.showlogs === true) {
        this.channel.errorNotEmpty(Core_Array_Uint8_To_String(await Async_Core_Stream_Uint8_Read_All(p0.stderr)));
        this.channel.logNotEmpty(Core_Array_Uint8_To_String(await Async_Core_Stream_Uint8_Read_All(p0.stdout)));
      }
      this.channel.log(`End: "${this.config.cmd.join(' ')}" | Directory: "${this.config.dir}"`);
    } catch (error) {
      this.channel.error(error, `Command: "${this.config.cmd.join(' ')}" | Directory: "${this.config.dir}"`);
    }
  }
}
type SpawnOptions = NonNullable<Parameters<typeof Bun.spawn>[1]>;
interface Config {
  cmd: string[];
  /** @default process.cwd() */
  dir?: string;
  /** @default true */
  showlogs?: boolean;
  /** @default 'ignore' */
  stdin?: SpawnOptions['stdin'];
}
