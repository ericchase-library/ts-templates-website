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

/**
 * !! WARNING: This step can DELETE entire directories. Use with caution. !!
 */
export function Step_FS_Mirror_Directory(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_FS_Mirror_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.config.exclude_patterns ??= [];
    this.config.include_patterns ??= ['*'];
    this.config.from_path = NODE_PATH.join(this.config.from_path);
    this.config.to_path = NODE_PATH.join(this.config.to_path);
  }
  async onRun(): Promise<void> {
    if (this.config.from_path === this.config.to_path) {
      // same directory, skip
      return;
    }
    {
      const { error, value } = await Async_NodePlatform_Path_Get_Stats(this.config.from_path);
      if (value === undefined) {
        throw error;
      }
    }
    {
      const { error, value } = await Async_NodePlatform_Directory_Create(this.config.to_path, true);
      if (value === undefined) {
        throw error;
      }
    }
    const set_from = await Async_BunPlatform_Glob_Scan_Ex(this.config.from_path, this.config.include_patterns ?? ['*'], this.config.exclude_patterns ?? []);
    const set_to = await Async_BunPlatform_Glob_Scan_Ex(this.config.to_path, ['**'], this.config.exclude_patterns ?? []);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = NODE_PATH.join(this.config.from_path, path);
      const to = NODE_PATH.join(this.config.to_path, path);
      if ((await Async_BunPlatform_File_Copy(from, to, true)).value === true) {
        await FILESTATS.UpdateStats(to);
        this.channel.log(`Copied "${from}" -> "${to}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = NODE_PATH.join(this.config.from_path, path);
      const to = NODE_PATH.join(this.config.to_path, path);
      if ((await FILESTATS.PathsAreEqual(from, to)).data !== true) {
        if ((await Async_BunPlatform_File_Copy(from, to, true)).value === true) {
          await FILESTATS.UpdateStats(from);
          await FILESTATS.UpdateStats(to);
          this.channel.log(`Replaced "${from}" -> "${to}"`);
        }
      }
    }
    // remove all files that shouldn't be
    for (const path of await Async_BunPlatform_Glob_Scan_Ex(this.config.to_path, ['**'], [...set_from, ...(this.config.exclude_patterns ?? [])])) {
      const to = NODE_PATH.join(this.config.to_path, path);
      if ((await Async_NodePlatform_File_Delete(to)).value === true) {
        FILESTATS.RemoveStats(to);
        this.channel.log(`Deleted "${to}"`);
      }
    }
    // remove empty directories
    const directories: string[] = [];
    const { value: entries } = await Async_NodePlatform_Directory_ReadDir(this.config.to_path, true);
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
interface Config {
  /** @default [] */
  exclude_patterns?: string[];
  /** @default ['*'] */
  include_patterns?: string[];
  from_path: string;
  to_path: string;
}
