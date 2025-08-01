import { Async_BunPlatform_File_Copy } from '../../../src/lib/ericchase/BunPlatform_File_Copy.js';
import { Async_BunPlatform_Glob_Scan_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Ex.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../../src/lib/ericchase/NodePlatform_Directory_Create.js';
import { Async_NodePlatform_Directory_Delete } from '../../../src/lib/ericchase/NodePlatform_Directory_Delete.js';
import { Async_NodePlatform_Directory_ReadDir } from '../../../src/lib/ericchase/NodePlatform_Directory_ReadDir.js';
import { Async_NodePlatform_File_Delete } from '../../../src/lib/ericchase/NodePlatform_File_Delete.js';
import { Async_NodePlatform_Path_Get_Stats } from '../../../src/lib/ericchase/NodePlatform_Path_Get_Stats.js';
import { Builder } from '../../core/Builder.js';
import { FILESTATS } from '../../core/Cacher.js';
import { Logger } from '../../core/Logger.js';

// !! WARNING: This step can DELETE entire directories. Use with caution!!

export function Step_FS_Mirror_Directory(options: { from: string; to: string; include_patterns?: string[]; exclude_patterns?: string[] }): Builder.Step {
  return new Class({
    from: NODE_PATH.join(options.from),
    to: NODE_PATH.join(options.to),
    include_patterns: options.include_patterns ?? ['*'],
    exclude_patterns: options.exclude_patterns ?? [],
  });
}
class Class implements Builder.Step {
  StepName = Step_FS_Mirror_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(
    readonly options: {
      from: string;
      to: string;
      include_patterns: string[];
      exclude_patterns: string[];
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
    const set_to = await Async_BunPlatform_Glob_Scan_Ex(this.options.to, ['**/*'], this.options.exclude_patterns);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = NODE_PATH.join(this.options.from, path);
      const to = NODE_PATH.join(this.options.to, path);
      if ((await Async_BunPlatform_File_Copy(from, to, true)).value === true) {
        await FILESTATS.UpdateStats(to);
        this.channel.log(`Copied "${from}" -> "${to}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = NODE_PATH.join(this.options.from, path);
      const to = NODE_PATH.join(this.options.to, path);
      if ((await FILESTATS.PathsAreEqual(from, to)).data !== true) {
        if ((await Async_BunPlatform_File_Copy(from, to, true)).value === true) {
          await FILESTATS.UpdateStats(from);
          await FILESTATS.UpdateStats(to);
          this.channel.log(`Replaced "${from}" -> "${to}"`);
        }
      }
    }
    // remove all files that shouldn't be
    for (const path of await Async_BunPlatform_Glob_Scan_Ex(this.options.to, ['**/*'], [...set_from, ...this.options.exclude_patterns])) {
      const to = NODE_PATH.join(this.options.to, path);
      if ((await Async_NodePlatform_File_Delete(to)).value === true) {
        FILESTATS.RemoveStats(to);
        this.channel.log(`Deleted "${to}"`);
      }
    }
    // remove empty directories
    const directories: string[] = [];
    const { value: entries } = await Async_NodePlatform_Directory_ReadDir(this.options.to, true);
    for (const entry of entries ?? []) {
      if (entry.isDirectory() === true) {
        directories.push(NODE_PATH.join(entry.parentPath, entry.name));
      }
    }
    for (const dir of directories.sort().reverse()) {
      if ((await Async_NodePlatform_Directory_Delete(dir, false)).value === true) {
        this.channel.log(`Deleted "${dir}"`);
      }
    }
  }
}
