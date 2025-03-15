import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { globScan } from 'src/lib/ericchase/Platform/util.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Cache_QueryFileStats, Cache_RemoveFileStats, Cache_UpdateFileStats } from 'tools/lib/cache/FileStatsCache.js';
import { Step } from 'tools/lib/Step.js';

// !! WARNING: This can DELETE entire directories. Use with caution!!

const logger = Logger(__filename, Step_MirrorDirectory.name);

export function Step_MirrorDirectory(options: { from: CPath | string; to: CPath | string; include_patterns?: string[]; exclude_patterns?: string[] }): Step {
  return new CStep_MirrorDirectory({
    from: Path(options.from),
    to: Path(options.to),
    include_patterns: options.include_patterns ?? ['*'],
    exclude_patterns: options.exclude_patterns ?? [],
  });
}

class CStep_MirrorDirectory implements Step {
  logger = logger.newChannel();
  constructor(
    readonly options: {
      from: CPath;
      to: CPath;
      include_patterns: string[];
      exclude_patterns: string[];
    },
  ) {}
  async run(builder: BuilderInternal) {
    this.logger.logWithDate();
    try {
      await builder.platform.Path.getStats(this.options.from);
    } catch (error) {
      throw new Error(`The "from" path ("${this.options.from.raw}") does not exist.`);
    }
    await builder.platform.Directory.create(this.options.to);
    const set_from = await globScan(builder.platform, this.options.from, this.options.include_patterns, this.options.exclude_patterns);
    const set_to = await globScan(builder.platform, this.options.to, ['**/*'], this.options.exclude_patterns);
    // remove all files that shouldn't be
    for (const path of set_to.difference(set_from)) {
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.delete(to)) === true) {
        Cache_RemoveFileStats(to);
        this.logger.log(`Deleted "${to.raw}"`);
      }
    }
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.copy(from, to, true)) === true) {
        await Cache_UpdateFileStats(to);
        this.logger.log(`Copied "${from.raw}" -> "${to.raw}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      const stats_from = Cache_QueryFileStats(from).data;
      const stats_to = Cache_QueryFileStats(to).data;
      if (stats_from === undefined || stats_to === undefined || stats_from.xxhash !== stats_to.xxhash) {
        if ((await builder.platform.File.copy(from, to, true)) === true) {
          await Cache_UpdateFileStats(from);
          await Cache_UpdateFileStats(to);
          this.logger.log(`Replaced "${from.raw}" -> "${to.raw}"`);
        }
      }
    }
  }
}
