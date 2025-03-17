import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, Step } from 'tools/lib/Builder.js';

const logger = Logger(Step_ExampleStep.name);

export function Step_ExampleStep(): Step {
  return new CStep_ExampleStep();
}

class CStep_ExampleStep implements Step {
  logger = logger.newChannel();

  constructor() {}
  async run(builder: BuilderInternal) {
    // Do whatever you want.
    this.logger.log('Example  Step');
  }
}
