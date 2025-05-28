import { Builder } from '../Builder.js';
import { Logger } from '../Logger.js';

// A "factory" function for creating and/or configuring the class. Also helps
// cut down on ceremonial code for the user.
export function Step_Example(): Builder.Step {
  return new Class();
}
class Class implements Builder.Step {
  StepName = Step_Example.name;
  channel = Logger(this.StepName).newChannel();

  constructor() {
    // The constructor can only be used for very simple setup. Asynchronous
    // calls cannot be awaited. The builder is not available, yet. Basically
    // nothing is setup, yet. Use this to pass in static data that you might
    // need.
  }
  async onStartUp(): Promise<void> {
    // Use this to do the majority of actual setup for this processor instance.
    // This method is called only once during the startup steps phase.
  }
  async onRun(): Promise<void> {
    // Do whatever you want here.
  }
  async onCleanUp(): Promise<void> {
    // Use this to do the majority of cleanup for this processor instance. This
    // method is called only once during the cleanup steps phase.
  }
}
