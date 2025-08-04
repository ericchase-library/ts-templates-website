import { Core_Array_Uint8_To_String } from '../../../src/lib/ericchase/Core_Array_Uint8_To_String.js';
import { Async_Core_Stream_Uint8_Read_All } from '../../../src/lib/ericchase/Core_Stream_Uint8_Read_All.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

/**
 * @defaults
 * @param config.dir `process.cwd()`;
 * @param config.showlogs `true`;
 * @param config.stdin `"ignore"`;
 */
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
