import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { globScan } from '../../../src/lib/ericchase/Platform/Glob_Utility.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';
import { Cache_AreFilesEqual, Cache_UpdateFileStats } from '../cache/FileStatsCache.js';

const logger = Logger(Step_CopyFiles.name);

export function Step_CopyFiles(options: { from: CPath | string; to: CPath | string; include_patterns?: (CPath | string)[]; exclude_patterns?: (CPath | string)[]; overwrite?: boolean }): Step {
  return new CStep_CopyFiles({
    from: Path(options.from),
    to: Path(options.to),
    include_patterns: (options.include_patterns ?? ['*']).map((pattern) => Path(pattern).standard),
    exclude_patterns: (options.exclude_patterns ?? []).map((pattern) => Path(pattern).standard),
    overwrite: options.overwrite ?? false,
  });
}

class CStep_CopyFiles implements Step {
  channel = logger.newChannel();

  constructor(
    readonly options: {
      from: CPath;
      to: CPath;
      include_patterns: string[];
      exclude_patterns: string[];
      overwrite: boolean;
    },
  ) {}
  async onRun(builder: BuilderInternal): Promise<void> {
    this.channel.log('Copy Files');
    try {
      await builder.platform.Path.getStats(this.options.from);
    } catch (error) {
      throw new Error(`The "from" path ("${this.options.from.raw}") does not exist.`);
    }
    await builder.platform.Directory.create(this.options.to);
    const set_from = await globScan(builder.platform, this.options.from, this.options.include_patterns, this.options.exclude_patterns);
    const set_to = await globScan(builder.platform, this.options.to, this.options.include_patterns, this.options.exclude_patterns);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.copy(from, to, this.options.overwrite)) === true) {
        await Cache_UpdateFileStats(to);
        this.channel.log(`Copied "${from.raw}" -> "${to.raw}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await Cache_AreFilesEqual(from, to)).data !== true) {
        if ((await builder.platform.File.copy(from, to, this.options.overwrite)) === true) {
          await Cache_UpdateFileStats(from);
          await Cache_UpdateFileStats(to);
          this.channel.log(`Replaced "${from.raw}" -> "${to.raw}"`);
        }
      }
    }
  }
}
