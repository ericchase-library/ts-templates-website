import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_ExampleStep.name);

// A "factory" function for creating and/or configuring the class. Also helps
// cut down on ceremonial code for the user.
export function Step_ExampleStep(): Step {
  return new CStep_ExampleStep();
}

class CStep_ExampleStep implements Step {
  channel = logger.newChannel();

  constructor() {
    // The constructor can only be used for very simple setup. Asynchronous
    // calls cannot be awaited. The builder is not available, yet. Basically
    // nothing is setup, yet. Use this to pass in static data that you might
    // need.
  }
  async onStartUp(builder: BuilderInternal): Promise<void> {
    // Use this to do the majority of actual setup for this processor instance.
    // This method is called only once during the startup steps phase.
  }
  async onRun(builder: BuilderInternal): Promise<void> {
    // Do whatever you want here.
    this.channel.log('Example Step');
  }
  async onCleanUp(builder: BuilderInternal): Promise<void> {
    // Use this to do the majority of cleanup for this processor instance. This
    // method is called only once during the cleanup steps phase.
  }
}
