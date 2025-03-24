import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_ExampleStep.name);

export function Step_ExampleStep(): Step {
  return new CStep_ExampleStep();
}

class CStep_ExampleStep implements Step {
  channel = logger.newChannel();

  constructor() {}
  async end(builder: BuilderInternal) {}
  async run(builder: BuilderInternal) {
    // Do whatever you want.
    this.channel.log('Example  Step');
  }
}
