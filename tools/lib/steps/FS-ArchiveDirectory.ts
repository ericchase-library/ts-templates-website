import { default as AdmZip } from 'adm-zip';
import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_ArchiveDirectory.name);

export function Step_ArchiveDirectory(dir: CPath | string, outfile: CPath | string): Step {
  return new CStep_ArchiveDirectory(Path(dir), Path(outfile));
}

class CStep_ArchiveDirectory implements Step {
  channel = logger.newChannel();

  constructor(
    readonly dir: CPath,
    readonly outpath: CPath,
  ) {}
  async onRun(builder: BuilderInternal): Promise<void> {
    this.channel.log('Archive Directory');
    try {
      const zip_instance = new AdmZip();
      zip_instance.addLocalFolder(this.dir.raw);
      zip_instance.writeZip(this.outpath.raw);
      const stats = await builder.platform.Path.getStats(this.outpath);
      if (stats.isFile() === true) {
        this.channel.log(`ZIP: [${stats.size}] ${this.outpath.raw}`);
      }
    } catch (error) {
      this.channel.log(`Error while creating archive for "${this.dir.raw}".`);
      throw error;
    }
  }
}
