import { NodePlatform_Directory_Async_Create, NodePlatform_Directory_Async_Delete, NodePlatform_Path_Join } from '../../../src/lib/ericchase/api.platform-node.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_FS_Clean_Directory(...paths: string[]): Builder.Step {
  return new Class(paths.map((path) => NodePlatform_Path_Join(path)));
}
class Class implements Builder.Step {
  StepName = Step_FS_Clean_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly paths: string[]) {}
  async onRun(): Promise<void> {
    for (const path of this.paths) {
      if ((await NodePlatform_Directory_Async_Delete(path, true)) === true) {
        if ((await NodePlatform_Directory_Async_Create(path, true)) === true) {
          this.channel.log(`Cleaned "${path}"`);
        }
      }
    }
  }
}
