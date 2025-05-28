import { BunPlatform_File_Async_Copy, BunPlatform_Glob_Ex_Async_Scan } from '../../../src/lib/ericchase/api.platform-bun.js';
import { NodePlatform_Directory_Async_Create, NodePlatform_Path_Async_GetStats, NodePlatform_Path_Join } from '../../../src/lib/ericchase/api.platform-node.js';
import { Builder } from '../../core/Builder.js';
import { FILESTATS } from '../../core/Cacher.js';
import { Logger } from '../../core/Logger.js';

export function Step_FS_Copy_Files(options: { from: string; to: string; include_patterns?: string[]; exclude_patterns?: string[]; overwrite?: boolean }): Builder.Step {
  return new Class({
    from: NodePlatform_Path_Join(options.from),
    to: NodePlatform_Path_Join(options.to),
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
    await NodePlatform_Path_Async_GetStats(this.options.from);
    await NodePlatform_Directory_Async_Create(this.options.to);
    const set_from = await BunPlatform_Glob_Ex_Async_Scan(this.options.from, this.options.include_patterns, this.options.exclude_patterns);
    const set_to = await BunPlatform_Glob_Ex_Async_Scan(this.options.to, this.options.include_patterns, this.options.exclude_patterns);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = NodePlatform_Path_Join(this.options.from, path);
      const to = NodePlatform_Path_Join(this.options.to, path);
      if ((await BunPlatform_File_Async_Copy(from, to, this.options.overwrite)) === true) {
        await FILESTATS.UpdateStats(to);
        this.channel.log(`Copied "${from}" -> "${to}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = NodePlatform_Path_Join(this.options.from, path);
      const to = NodePlatform_Path_Join(this.options.to, path);
      if ((await FILESTATS.PathsAreEqual(from, to)).data !== true) {
        if ((await BunPlatform_File_Async_Copy(from, to, this.options.overwrite)) === true) {
          await FILESTATS.UpdateStats(from);
          await FILESTATS.UpdateStats(to);
          this.channel.log(`Replaced "${from}" -> "${to}"`);
        }
      }
    }
  }
}
