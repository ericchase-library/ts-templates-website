import { Async_BunPlatform_Glob_Scan_Generator } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Generator.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Path_Is_Directory } from '../../../src/lib/ericchase/NodePlatform_Path_Is_Directory.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Step_FS_Copy_Files } from '../../core/step/Step_FS_Copy_Files.js';
import { Step_FS_Mirror_Directory } from '../../core/step/Step_FS_Mirror_Directory.js';

export function Step_Dev_Project_Sync_Core(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_Dev_Project_Sync_Core.name;
  channel = Logger(this.StepName).newChannel();

  steps: Builder.Step[] = [];

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.steps = [
      // Library
      Step_FS_Mirror_Directory({
        include_patterns: ['**'],
        from_dir: NODE_PATH.join(this.config.from_dir, Builder.Dir.Lib, 'ericchase'),
        into_dir: NODE_PATH.join(this.config.into_dir, Builder.Dir.Lib, 'ericchase'),
      }),
      Step_FS_Copy_Files({
        include_patterns: ['**'],
        from_dir: NODE_PATH.join(this.config.from_dir, Builder.Dir.Lib, 'server'),
        into_dir: NODE_PATH.join(this.config.into_dir, Builder.Dir.Lib, 'server'),
        overwrite: true,
      }),
    ];
    // Core Tools
    for await (const subpath of Async_BunPlatform_Glob_Scan_Generator(this.config.from_dir, `${Builder.Dir.Tools}/*`, { only_files: false })) {
      if (await Async_NodePlatform_Path_Is_Directory(NODE_PATH.join(this.config.from_dir, subpath))) {
        this.steps.push(
          Step_FS_Mirror_Directory({
            include_patterns: ['**'],
            from_dir: NODE_PATH.join(this.config.from_dir, subpath),
            into_dir: NODE_PATH.join(this.config.into_dir, subpath),
          }),
        );
      }
    }

    for (const step of this.steps) {
      try {
        await step.onStartUp?.();
      } catch (error) {
        this.channel.error(error, `Unhandled exception in "${step.StepName}" onStartUp:`);
      }
    }
  }
  async onRun(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.onRun?.();
      } catch (error) {
        this.channel.error(error, `Unhandled exception in "${step.StepName}" onRun:`);
      }
    }
  }
  async onCleanUp(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.onCleanUp?.();
      } catch (error) {
        this.channel.error(error, `Unhandled exception in "${step.StepName}" onCleanUp:`);
      }
    }
  }
}
interface Config {
  from_dir: string;
  into_dir: string;
}
