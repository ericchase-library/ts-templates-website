import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Step } from 'tools/lib/Step.js';

const logger = Logger(__filename, Step_CleanDirectory.name);

export function Step_CleanDirectory(paths: (CPath | string)[]): Step {
  return new CStep_CleanDirectory(paths.map((path) => Path(path)));
}

class CStep_CleanDirectory implements Step {
  logger = logger.newChannel();
  constructor(readonly paths: CPath[]) {}
  async run(builder: BuilderInternal) {
    this.logger.logWithDate();
    for (const path of this.paths) {
      await builder.platform.Directory.delete(path);
      await builder.platform.Directory.create(path);
    }
  }
}
