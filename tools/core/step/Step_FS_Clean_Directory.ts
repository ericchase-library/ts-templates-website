import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../../src/lib/ericchase/NodePlatform_Directory_Create.js';
import { Async_NodePlatform_Directory_Delete } from '../../../src/lib/ericchase/NodePlatform_Directory_Delete.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_FS_Clean_Directory(...dirpaths: string[]): Builder.Step {
  return new Class(dirpaths.map((path) => NODE_PATH.join(path)));
}
class Class implements Builder.Step {
  StepName = Step_FS_Clean_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly dirpaths: string[]) {}
  async onRun(): Promise<void> {
    for (const path of this.dirpaths) {
      if ((await Async_NodePlatform_Directory_Delete(path, true)).value === true) {
        if ((await Async_NodePlatform_Directory_Create(path, true)).value === true) {
          this.channel.log(`Cleaned "${path}"`);
        }
      }
    }
  }
}
