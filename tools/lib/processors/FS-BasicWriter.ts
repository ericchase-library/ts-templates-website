import { Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { globMatch } from 'src/lib/ericchase/Platform/util.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { ProcessorModule } from 'tools/lib/Processor.js';
import { ProjectFile } from 'tools/lib/ProjectFile.js';

const logger = Logger(__filename, Processor_BasicWriter.name);

export function Processor_BasicWriter(include_patterns: string[], exclude_patterns: string[]): ProcessorModule {
  return new CProcessor_BasicWriter(include_patterns, exclude_patterns);
}

class CProcessor_BasicWriter implements ProcessorModule {
  logger = logger.newChannel();

  constructor(
    readonly include_patterns: string[],
    readonly exclude_patterns: string[],
  ) {
    this.include_patterns.map((pattern) => Path(pattern).standard);
    this.exclude_patterns.map((pattern) => Path(pattern).standard);
  }

  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    for (const file of files) {
      if (globMatch(builder.platform, file.src_path.standard, this.include_patterns, this.exclude_patterns) === true) {
        file.addProcessor(this, this.onProcess);
      }
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {}

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    await file.write();
  }
}
