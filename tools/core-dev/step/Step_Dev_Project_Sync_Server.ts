import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Step_FS_Mirror_Directory } from '../../core/step/Step_FS_Mirror_Directory.js';

export function Step_Dev_Project_Sync_Server(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_Dev_Project_Sync_Server.name;
  channel = Logger(this.StepName).newChannel();

  steps: Builder.Step[] = [];

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.steps = [
      // Server
      Step_FS_Mirror_Directory({
        from_path: NODE_PATH.join(this.config.from_path, 'server'),
        to_path: NODE_PATH.join(this.config.to_path, 'server'),
        include_patterns: ['**'],
        exclude_patterns: ['.git/**', 'node_modules/**', 'public/**'],
      }),
    ];

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
  from_path: string;
  to_path: string;
}
