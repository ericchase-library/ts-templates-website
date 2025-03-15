import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { globScan } from 'src/lib/ericchase/Platform/util.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Cache_IsFileModified } from 'tools/lib/cache/FileStatsCache.js';
import { Step } from 'tools/lib/Step.js';

const logger = Logger(__filename, Step_CopyFiles.name);

export function Step_CopyFiles(options: { from: CPath | string; to: CPath | string; include_patterns?: string[]; exclude_patterns?: string[]; overwrite?: boolean }): Step {
  return new CStep_CopyFiles({
    from: Path(options.from),
    to: Path(options.to),
    include_patterns: options.include_patterns ?? ['*'],
    exclude_patterns: options.exclude_patterns ?? [],
    overwrite: options.overwrite ?? false,
  });
}

class CStep_CopyFiles implements Step {
  logger = logger.newChannel();
  constructor(
    readonly options: {
      from: CPath;
      to: CPath;
      include_patterns: string[];
      exclude_patterns: string[];
      overwrite: boolean;
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
    const set_to = await globScan(builder.platform, this.options.to, this.options.include_patterns, this.options.exclude_patterns);
    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.copy(from, to, this.options.overwrite)) === true) {
        this.logger.log(`Copied "${from.raw}" -> "${to.raw}"`);
      }
    }
    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = Path(this.options.from, path);
      const result = await Cache_IsFileModified(from);
      if (result.data === true) {
        const to = Path(this.options.to, path);
        if ((await builder.platform.File.copy(from, to, this.options.overwrite)) === true) {
          this.logger.log(`Replaced "${from.raw}" -> "${to.raw}"`);
        }
      } else if (result.error !== undefined) {
        throw result.error;
      }
    }
  }
}
