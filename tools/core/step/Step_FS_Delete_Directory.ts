import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Delete } from '../../../src/lib/ericchase/NodePlatform_Directory_Delete.js';
import { Builder } from '../Builder.js';
import { Logger } from '../Logger.js';

export function Step_FS_Delete_Directory(...dirpaths: string[]): Builder.Step {
  return new Class(dirpaths.map((path) => NODE_PATH.join(path)));
}
class Class implements Builder.Step {
  StepName = Step_FS_Delete_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly dirpaths: string[]) {}
  async onRun(): Promise<void> {
    for (const path of this.dirpaths) {
      if ((await Async_NodePlatform_Directory_Delete(path, true)).value === true) {
        this.channel.log(`Deleted "${path}"`);
      }
    }
  }
}
