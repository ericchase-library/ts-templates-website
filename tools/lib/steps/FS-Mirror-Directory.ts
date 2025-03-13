import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { globScan } from 'src/lib/ericchase/Platform/util.js';
import { ConsoleLog } from 'src/lib/ericchase/Utility/Console.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';
import { Cache_IsFileModified } from 'tools/lib/cache/FileStatsCache.js';

// !! WARNING: This can DELETE entire directories. Use with caution!!

class CBuildStep_FSMirrorDirectory implements BuildStep {
  constructor(
    readonly options: {
      from: CPath;
      to: CPath;
      include_patterns: string[];
      exclude_patterns: string[];
    },
  ) {}
  async run(builder: BuilderInternal) {
    try {
      await builder.platform.Path.getStats(this.options.from);
    } catch (error) {
      throw new Error(`The "from" path ("${this.options.from.raw}") does not exist.`);
    }
    await builder.platform.Directory.create(this.options.to);

    const set_from = await globScan(builder.platform, this.options.from, this.options.include_patterns, this.options.exclude_patterns);
    const set_to = await globScan(builder.platform, this.options.to, this.options.include_patterns, this.options.exclude_patterns);

    // remove all files that shouldn't be
    for (const path of set_to.difference(set_from)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      if ((await builder.platform.File.delete(to)) === true) {
        ConsoleLog(`Deleted "${from.raw}" -> "${to.raw}"`);
      }
    }

    // copy all files that are missing
    for (const path of set_from.difference(set_to)) {
      const from = Path(this.options.from, path);
      const to = Path(this.options.to, path);
      await Cache_IsFileModified(from);
      if ((await builder.platform.File.copy(from, to, true)) === true) {
        ConsoleLog(`Copied "${from.raw}" -> "${to.raw}"`);
      }
    }

    // check matching files for modification
    for (const path of set_from.intersection(set_to)) {
      const from = Path(this.options.from, path);
      const result = await Cache_IsFileModified(from);
      if (result.data === true) {
        const to = Path(this.options.to, path);
        if ((await builder.platform.File.copy(from, to, true)) === true) {
          ConsoleLog(`Copied "${from.raw}" -> "${to.raw}"`);
        }
      } else if (result.error !== undefined) {
        throw result.error;
      }
    }
  }
}

export function BuildStep_FSMirrorDirectory(options: { from: CPath | string; to: CPath | string; include_patterns?: string[]; exclude_patterns?: string[] }): BuildStep {
  return new CBuildStep_FSMirrorDirectory({
    from: Path(options.from),
    to: Path(options.to),
    include_patterns: options.include_patterns ?? ['*'],
    exclude_patterns: options.exclude_patterns ?? [],
  });
}
