import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_ExampleProcessorModule.name);

// A "factory" function for creating and/or configuring the class. Also helps
// cut down on ceremonial code for the user.
export function Processor_ExampleProcessorModule(): ProcessorModule {
  return new CProcessor_ExampleProcessorModule();
}

class CProcessor_ExampleProcessorModule implements ProcessorModule {
  channel = logger.newChannel();

  constructor() {
    // The constructor can only be used for very simple setup. Asynchronous
    // calls cannot be awaited. The builder is not available, yet. Basically
    // nothing is setup, yet. Use this to pass in static data that you might
    // need.
  }
  async onStartUp(builder: BuilderInternal): Promise<void> {
    // Use this to do the majority of actual setup for this processor instance.
    // This method is called only once after the startup steps phase.
  }
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    // Determine which files should be processed.
    for (const file of files) {
      // Example glob matcher for text (.txt) files:
      if (builder.platform.Utility.globMatch(file.src_path.standard, '**/*.txt')) {
        file.addProcessor(this, this.onProcess);
      }
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    // Handle any necessary cleanup for this class instance.
    // The files may no longer exist, but you may still have access to their
    // cached contents.
  }
  async onCleanUp(builder: BuilderInternal): Promise<void> {
    // Use this to do the majority of cleanup for this processor instance. This
    // method is called only once after the cleanup steps phase.
  }

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    // Do whatever you want to do with the file. You can write multiple process
    // methods for different file paths. This method is not part of the
    // ProcessorModule interface. You could potentially add an anonymous
    // function during the onAdd call if you want; but, using a class method is
    // a bit cleaner and easier to work with.
    this.channel.log(`Example Processor: "${file.src_path.raw}"`);
  }
}
