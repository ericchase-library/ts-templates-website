import AdmZip from 'adm-zip';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Path_Get_Stats } from '../../../src/lib/ericchase/NodePlatform_Path_Get_Stats.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export function Step_FS_Archive_Directory(dir: string, outfile: string): Builder.Step {
  return new Class(NODE_PATH.join(dir), NODE_PATH.join(outfile));
}
class Class implements Builder.Step {
  StepName = Step_FS_Archive_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(
    readonly dir: string,
    readonly outpath: string,
  ) {}
  async onRun(): Promise<void> {
    try {
      const zip_instance = new AdmZip();
      zip_instance.addLocalFolder(this.dir);
      zip_instance.writeZip(this.outpath);
      const { value: stats } = await Async_NodePlatform_Path_Get_Stats(this.outpath);
      if (stats?.isFile() === true) {
        this.channel.log(`ZIP: [${stats.size}] ${this.outpath}`);
      }
    } catch (error) {
      this.channel.log(`Error while creating archive for "${this.dir}".`);
      throw error;
    }
  }
}
