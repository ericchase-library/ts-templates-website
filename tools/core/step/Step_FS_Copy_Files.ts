import { Async_BunPlatform_File_Copy } from '../../../src/lib/ericchase/BunPlatform_File_Copy.js';
import { Async_BunPlatform_Glob_Scan_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Ex.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../../src/lib/ericchase/NodePlatform_Directory_Create.js';
import { Async_NodePlatform_Path_Get_Stats } from '../../../src/lib/ericchase/NodePlatform_Path_Get_Stats.js';
import { Builder } from '../../core/Builder.js';
import { FILESTATS } from '../../core/Cacher.js';
import { Logger } from '../../core/Logger.js';

export function Step_FS_Copy_Files(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_FS_Copy_Files.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.config.exclude_patterns ??= [];
    this.config.include_patterns ??= ['*'];
    this.config.from_dir = NODE_PATH.join(this.config.from_dir);
    this.config.into_dir = NODE_PATH.join(this.config.into_dir);
    this.config.overwrite ??= false;
  }
  async onRun(): Promise<void> {
    if (this.config.from_dir === this.config.into_dir) {
      // same directory, skip
      return;
    }
    {
      const { error, value } = await Async_NodePlatform_Path_Get_Stats(this.config.from_dir);
      if (value === undefined) {
        throw error;
      }
    }
    {
      const { error, value } = await Async_NodePlatform_Directory_Create(this.config.into_dir, true);
      if (value === undefined) {
        throw error;
      }
    }
    const set_from = await Async_BunPlatform_Glob_Scan_Ex(this.config.from_dir, this.config.include_patterns ?? [], this.config.exclude_patterns ?? []);
    const set_to = await Async_BunPlatform_Glob_Scan_Ex(this.config.into_dir, this.config.include_patterns ?? [], this.config.exclude_patterns ?? []);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = NODE_PATH.join(this.config.from_dir, path);
      const to = NODE_PATH.join(this.config.into_dir, path);
      if ((await Async_BunPlatform_File_Copy(from, to, this.config.overwrite ?? false)).value === true) {
        await FILESTATS.UpdateStats(to);
        this.channel.log(`Write "${from}" -> "${to}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = NODE_PATH.join(this.config.from_dir, path);
      const to = NODE_PATH.join(this.config.into_dir, path);
      if ((await FILESTATS.PathsAreEqual(from, to)).data !== true) {
        if ((await Async_BunPlatform_File_Copy(from, to, this.config.overwrite ?? false)).value === true) {
          await FILESTATS.UpdateStats(from);
          await FILESTATS.UpdateStats(to);
          this.channel.log(`Overwrite "${from}" -> "${to}"`);
        }
      }
    }
  }
}
interface Config {
  /** @default [] */
  exclude_patterns?: string[];
  /** @default ['*'] */
  include_patterns?: string[];
  from_dir: string;
  into_dir: string;
  /** @default false */
  overwrite?: boolean;
}
