import { Async_BunPlatform_File_Copy } from '../../../src/lib/ericchase/BunPlatform_File_Copy.js';
import { Async_BunPlatform_Glob_Scan_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Ex.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../../src/lib/ericchase/NodePlatform_Directory_Create.js';
import { Async_NodePlatform_Path_Get_Stats } from '../../../src/lib/ericchase/NodePlatform_Path_Get_Stats.js';
import { Builder } from '../../core/Builder.js';
import { FILESTATS } from '../../core/Cacher.js';
import { Logger } from '../../core/Logger.js';

export function Step_FS_Copy_Files(options: { from: string; to: string; include_patterns?: string[]; exclude_patterns?: string[]; overwrite?: boolean }): Builder.Step {
  return new Class({
    from: NODE_PATH.join(options.from),
    to: NODE_PATH.join(options.to),
    include_patterns: options.include_patterns ?? ['*'],
    exclude_patterns: options.exclude_patterns ?? [],
    overwrite: options.overwrite ?? false,
  });
}
class Class implements Builder.Step {
  StepName = Step_FS_Copy_Files.name;
  channel = Logger(this.StepName).newChannel();

  constructor(
    readonly options: {
      from: string;
      to: string;
      include_patterns: string[];
      exclude_patterns: string[];
      overwrite: boolean;
    },
  ) {}
  async onRun(): Promise<void> {
    if (this.options.from === this.options.to) {
      // same directory, skip
      return;
    }
    await Async_NodePlatform_Path_Get_Stats(this.options.from);
    await Async_NodePlatform_Directory_Create(this.options.to, true);
    const set_from = await Async_BunPlatform_Glob_Scan_Ex(this.options.from, this.options.include_patterns, this.options.exclude_patterns);
    const set_to = await Async_BunPlatform_Glob_Scan_Ex(this.options.to, this.options.include_patterns, this.options.exclude_patterns);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = NODE_PATH.join(this.options.from, path);
      const to = NODE_PATH.join(this.options.to, path);
      if ((await Async_BunPlatform_File_Copy(from, to, this.options.overwrite)).value === true) {
        await FILESTATS.UpdateStats(to);
        this.channel.log(`Copied "${from}" -> "${to}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = NODE_PATH.join(this.options.from, path);
      const to = NODE_PATH.join(this.options.to, path);
      if ((await FILESTATS.PathsAreEqual(from, to)).data !== true) {
        if ((await Async_BunPlatform_File_Copy(from, to, this.options.overwrite)).value === true) {
          await FILESTATS.UpdateStats(from);
          await FILESTATS.UpdateStats(to);
          this.channel.log(`Replaced "${from}" -> "${to}"`);
        }
      }
    }
  }
}
