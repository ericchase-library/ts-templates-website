import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_CleanDirectory.name);

export function Step_CleanDirectory(...paths: (CPath | string)[]): Step {
  return new CStep_CleanDirectory(paths.map((path) => Path(path)));
}

class CStep_CleanDirectory implements Step {
  channel = logger.newChannel();

  constructor(readonly paths: CPath[]) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    this.channel.log('Clean Directory');
    for (const path of this.paths) {
      await builder.platform.Directory.delete(path);
      await builder.platform.Directory.create(path);
    }
  }
}
