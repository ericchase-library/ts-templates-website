import { Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { globMatch } from 'src/lib/ericchase/Platform/util.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from 'tools/lib/Builder.js';

const logger = Logger(Processor_BasicWriter.name);

export function Processor_BasicWriter(include_patterns: string[], exclude_patterns: string[]): ProcessorModule {
  return new CProcessor_BasicWriter(
    include_patterns.map((pattern) => Path(pattern).standard),
    exclude_patterns.map((pattern) => Path(pattern).standard),
  );
}

class CProcessor_BasicWriter implements ProcessorModule {
  channel = logger.newChannel();

  constructor(
    readonly include_patterns: string[],
    readonly exclude_patterns: string[],
  ) {}

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
