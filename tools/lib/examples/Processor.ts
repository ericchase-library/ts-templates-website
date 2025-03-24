import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_ExampleProcessorModule.name);

// A "factory" function for creating and/or configuring the class. Also helps
// cut down on code ceremony for the user.
export function Processor_ExampleProcessorModule(): ProcessorModule {
  return new CProcessor_ExampleProcessorModule();
}

// The class used to setup files with the processor function.
class CProcessor_ExampleProcessorModule implements ProcessorModule {
  channel = logger.newChannel();

  constructor() {}
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    // Determine which files should be processed.
    for (const file of files) {
      file.addProcessor(this, this.onProcess);
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    // Handle any necessary cleanup for this class instance.
    // The files may no longer exist, but you may still have access to their
    // cached contents.
  }
  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    // Do whatever you want to do with the file.
    this.channel.log(`Example Processor: "${file.src_path.raw}"`);
  }
}
