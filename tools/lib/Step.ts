import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';

// Type Declarations

export interface Step {
  run: (builder: BuilderInternal) => Promise<void>;
}

// Example

const logger = Logger(__filename, Step_ExampleStep.name);

export function Step_ExampleStep(): Step {
  return new CStep_ExampleStep();
}

class CStep_ExampleStep implements Step {
  logger = logger.newChannel();

  constructor() {}
  async run(builder: BuilderInternal) {
    // Do whatever you want.
    this.logger.logWithDate('Example Build Step');
  }
}
