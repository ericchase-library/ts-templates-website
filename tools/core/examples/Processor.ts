import { BunPlatform_Glob_Match } from '../../../src/lib/ericchase/BunPlatform_Glob_Match.js';
import { Builder } from '../Builder.js';
import { Logger } from '../Logger.js';

// A "factory" function for creating and/or configuring the class. Also helps
// cut down on ceremonial code for the user.
export function Processor_Example(): Builder.Processor {
  return new Class();
}
class Class implements Builder.Processor {
  ProcessorName = Processor_Example.name;
  channel = Logger(this.ProcessorName).newChannel();

  constructor() {
    // The constructor can only be used for very simple setup. Asynchronous
    // calls cannot be awaited. The builder is not available, yet. Basically
    // nothing is setup, yet. Use this to pass in static data that you might
    // need.
  }
  async onStartUp(): Promise<void> {
    // Use this to do the majority of actual setup for this processor instance.
    // This method is called only once after the startup steps phase.
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    // Determine which files should be processed.
    for (const file of files) {
      const query = file.src_path;
      // Example glob matcher for text (.txt) files:
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*.txt`)) {
        file.addProcessor(this, this.onProcess);
      }
    }
  }
  async onRemove(files: Set<Builder.File>): Promise<void> {
    // Handle any necessary cleanup for this class instance.
    // The files may no longer exist, but you may still have access to their
    // cached contents.
  }
  async onCleanUp(): Promise<void> {
    // Use this to do the majority of cleanup for this processor instance. This
    // method is called only once after the cleanup steps phase.
  }

  async onProcess(file: Builder.File): Promise<void> {
    // Do whatever you want to do with the file. You can write multiple process
    // methods for different file paths. This method is not part of the
    // ProcessorModule interface. You could potentially add an anonymous
    // function during the onAdd call if you want; but, using a class method is
    // a bit cleaner and easier to work with.
    this.channel.log(`Example Processor: "${file.src_path}"`);
  }
}
