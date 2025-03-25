import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';
import { Step_CopyFiles } from './FS-CopyFiles.js';
import { Step_MirrorDirectory } from './FS-MirrorDirectory.js';

const logger = Logger(Step_Project_PullLib.name);

export function Step_Project_PullLib(project_dir: CPath | string): Step {
  return new CStep_Project_PullLib(Path(project_dir));
}

class CStep_Project_PullLib implements Step {
  channel = logger.newChannel();

  constructor(readonly external_directory: CPath) {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    this.channel.log('Pull Lib');
    const steps = [
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'src/lib/ericchase'),
        to: Path(builder.dir.lib, 'ericchase'),
        include_patterns: ['**/*.ts'],
        //
      }),
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'tools/lib'),
        to: Path(builder.dir.tools, 'lib'),
        include_patterns: ['**/*.ts'],
        //
      }),
      Step_CopyFiles({
        from: Path(this.external_directory, './'),
        to: './',
        include_patterns: [
          '.vscode/settings.json',
          '.gitignore',
          '.prettierignore',
          '.prettierrc',
          'biome.json',
          'package.json',
          'tsconfig.json',
          //
        ],
        overwrite: false,
      }),
    ];
    for (const step of steps) {
      await step.run(builder);
    }
  }
}
