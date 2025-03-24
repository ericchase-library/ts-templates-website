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
      // Mirror Database
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'database'),
        to: 'database',
        include_patterns: ['**/*'],
        //
      }),

      // Mirror Server
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'server'),
        to: 'server',
        include_patterns: ['**/*'],
        exclude_patterns: ['node_modules/**/*', 'bun.lockb'],
        //
      }),

      // Mirror Lib
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'src/lib/database'),
        to: Path(builder.dir.lib, 'database'),
        include_patterns: ['**/*.ts'],
        exclude_patterns: ['**/*{.deprecated,.example,.test}.ts'],
        //
      }),
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'src/lib/ericchase'),
        to: Path(builder.dir.lib, 'ericchase'),
        include_patterns: ['**/*.ts'],
        exclude_patterns: ['**/*{.deprecated,.example,.test}.ts'],
        //
      }),
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'src/lib/server'),
        to: Path(builder.dir.lib, 'server'),
        include_patterns: ['**/*.ts'],
        exclude_patterns: ['**/*{.deprecated,.example,.test}.ts'],
        //
      }),

      // Mirror Tools Lib
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'tools/lib'),
        to: Path(builder.dir.tools, 'lib'),
        include_patterns: ['**/*.ts'],
        exclude_patterns: ['**/*{.deprecated,.example,.test}.ts'],
        //
      }),

      // Copy Example Build Scripts
      Step_CopyFiles({
        from: Path(this.external_directory, 'tools/lib/examples'),
        to: Path(builder.dir.tools),
        include_patterns: [
          'build.ts',
          'pull.ts',
          //
        ],
        overwrite: false,
      }),

      // Copy Root Files
      Step_CopyFiles({
        from: Path(this.external_directory, './'),
        to: './',
        include_patterns: [
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
