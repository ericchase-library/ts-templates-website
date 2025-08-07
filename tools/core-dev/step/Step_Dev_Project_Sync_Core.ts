import { Async_BunPlatform_Glob_Scan_Generator } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Generator.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Path_Is_Directory } from '../../../src/lib/ericchase/NodePlatform_Path_Is_Directory.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
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
        from_path: NODE_PATH.join(this.config.from_path, Builder.Dir.Lib, 'ericchase'),
        to_path: NODE_PATH.join(this.config.to_path, Builder.Dir.Lib, 'ericchase'),
        include_patterns: ['**/*'],
      }),
    ];
    // Core Tools
    for await (const subpath of Async_BunPlatform_Glob_Scan_Generator(this.config.from_path, `${Builder.Dir.Tools}/*`, { only_files: false })) {
      if (await Async_NodePlatform_Path_Is_Directory(NODE_PATH.join(this.config.from_path, subpath))) {
        this.steps.push(
          Step_FS_Mirror_Directory({
            from_path: NODE_PATH.join(this.config.from_path, subpath),
            to_path: NODE_PATH.join(this.config.to_path, subpath),
            include_patterns: ['**/*'],
          }),
        );
      }
    }

    for (const step of this.steps) {
      await step.onStartUp?.();
    }
  }
  async onRun(): Promise<void> {
    for (const step of this.steps) {
      await step.onRun?.();
    }
  }
  async onCleanUp(): Promise<void> {
    for (const step of this.steps) {
      await step.onCleanUp?.();
    }
  }
}
interface Config {
  from_path: string;
  to_path: string;
}
