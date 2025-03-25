import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { globScan } from '../../../src/lib/ericchase/Platform/Glob_Utility.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';
import { Cache_AreFilesEqual, Cache_RemoveFileStats, Cache_UpdateFileStats } from '../cache/FileStatsCache.js';

// !! WARNING: This can DELETE entire directories. Use with caution!!

const logger = Logger(Step_MirrorDirectory.name);

export function Step_MirrorDirectory(options: { from: CPath | string; to: CPath | string; include_patterns?: (CPath | string)[]; exclude_patterns?: (CPath | string)[] }): Step {
  return new CStep_MirrorDirectory({
    from: Path(options.from),
    to: Path(options.to),
    include_patterns: (options.include_patterns ?? ['*']).map((pattern) => Path(pattern).standard),
    exclude_patterns: (options.exclude_patterns ?? []).map((pattern) => Path(pattern).standard),
  });
}

class CStep_MirrorDirectory implements Step {
  channel = logger.newChannel();

  constructor(
    readonly options: {
      from: CPath;
      to: CPath;
      include_patterns: string[];
      exclude_patterns: string[];
    },
  ) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    this.channel.log('Mirror Directory');
    try {
      await builder.platform.Path.getStats(this.options.from);
    } catch (error) {
      throw new Error(`The "from" path ("${this.options.from.raw}") does not exist.`);
    }
    await builder.platform.Directory.create(this.options.to);
    const set_from = await globScan(builder.platform, this.options.from, this.options.include_patterns, this.options.exclude_patterns);
    const set_to = await globScan(builder.platform, this.options.to, ['**/*'], this.options.exclude_patterns);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.copy(from, to, true)) === true) {
        await Cache_UpdateFileStats(to);
        this.channel.log(`Copied "${from.raw}" -> "${to.raw}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await Cache_AreFilesEqual(from, to)).data !== true) {
        if ((await builder.platform.File.copy(from, to, true)) === true) {
          await Cache_UpdateFileStats(from);
          await Cache_UpdateFileStats(to);
          this.channel.log(`Replaced "${from.raw}" -> "${to.raw}"`);
        }
      }
    }
    // remove all files that shouldn't be
    for (const path of await globScan(builder.platform, this.options.to, ['**/*'], [...set_from, ...this.options.exclude_patterns])) {
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.delete(to)) === true) {
        Cache_RemoveFileStats(to);
        this.channel.log(`Deleted "${to.raw}"`);
      }
    }
  }
}
