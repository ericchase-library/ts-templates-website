import { Async_NodePlatform_Path_Get_Stats } from '../../../src/lib/ericchase/NodePlatform_Path_Get_Stats.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { ZIP_UTIL } from '../bundle/zip-util/zip-util.js';

export function Step_FS_Archive_Directory(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_FS_Archive_Directory.name;
  channel = Logger(this.StepName).newChannel();

  constructor(readonly config: Config) {}
  async onRun(): Promise<void> {
    try {
      const zip = ZIP_UTIL.Instance();
      zip.addLocalFolder(this.config.dirpath);
      zip.writeZip(this.config.outfile);
      const { error, value: stats } = await Async_NodePlatform_Path_Get_Stats(this.config.outfile);
      if (stats !== undefined) {
        if (stats.isFile() === true) {
          this.channel.log(`ZIP: [${stats.size}] ${this.config.outfile}`);
        }
      } else {
        throw error;
      }
    } catch (error) {
      this.channel.log(`Error while creating archive for "${this.config.dirpath}".`);
      throw error;
    }
  }
}
interface Config {
  dirpath: string;
  outfile: string;
}
