import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';

class CBuildStep_FSCleanDirectory implements BuildStep {
  constructor(readonly paths: CPath[]) {}
  async run(builder: BuilderInternal) {
    for (const path of this.paths) {
      await builder.platform.Directory.delete(path);
      await builder.platform.Directory.create(path);
    }
  }
}

export function BuildStep_FSCleanDirectory(paths: (CPath | string)[]): BuildStep {
  return new CBuildStep_FSCleanDirectory(paths.map((path) => Path(path)));
}
