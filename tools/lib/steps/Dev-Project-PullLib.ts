import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { ConsoleLogWithDate } from 'src/lib/ericchase/Utility/Console.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';
import { Step_CopyFiles } from 'tools/lib/steps/FS-CopyFiles.js';
import { Step_MirrorDirectory } from 'tools/lib/steps/FS-MirrorDirectory.js';

export function Step_Project_PullLib(project_dir: CPath | string): BuildStep {
  return new CStep_Project_PullLib(Path(project_dir));
}

class CStep_Project_PullLib implements BuildStep {
  constructor(readonly external_directory: CPath) {}
  async run(builder: BuilderInternal) {
    ConsoleLogWithDate(this.constructor.name);
    const steps = [
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
        from: Path(this.external_directory, 'src/lib/ericchase'),
        to: Path(builder.dir.lib, 'ericchase'),
        include_patterns: ['**/*.ts'],
        //
      }),

      // Mirror Tools Lib
      Step_MirrorDirectory({
        from: Path(this.external_directory, 'tools/lib'),
        to: Path(builder.dir.tools, 'lib'),
        include_patterns: ['**/*.ts'],
        //
      }),

      // Copy Default Build Scripts
      Step_CopyFiles({
        from: Path(this.external_directory, 'tools'),
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
