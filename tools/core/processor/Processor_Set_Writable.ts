import { BunPlatform_Glob_Match_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Match_Ex.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

/**
 * Explicitly mark files as writable via include patterns and non-writable via
 * exclude_patterns.
 *
 * @defaults
 * @param config.exclude_patterns `[]`
 * @param config.include_patterns `[]`
 * @param extras.include_libdir `true`
 */
export function Processor_Set_Writable(config: Config = {}, extras: Extras = {}): Builder.Processor {
  return new Class(config, extras);
}
class Class implements Builder.Processor {
  ProcessorName = Processor_Set_Writable.name;
  channel = Logger(this.ProcessorName).newChannel();

  constructor(
    readonly config: Config,
    readonly extras: Extras,
  ) {
    this.config.exclude_patterns ??= [];
    this.config.include_patterns ??= [];
    this.extras.include_libdir ??= false;
  }
  async onStartUp(): Promise<void> {
    if (this.extras.include_libdir === false) {
      this.config.exclude_patterns?.push(`${Builder.Dir.Lib}/**/*`);
    }
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      const src_path = NodePlatform_PathObject_Relative_Class(file.src_path).join();
      if (BunPlatform_Glob_Match_Ex(src_path, this.config.exclude_patterns ?? [], []) === true) {
        file.iswritable = false;
        continue;
      }
      if (BunPlatform_Glob_Match_Ex(src_path, this.config.include_patterns ?? [], []) === true) {
        file.iswritable = true;
      }
    }
  }
}
interface Config {
  exclude_patterns?: string[];
  include_patterns?: string[];
}
interface Extras {
  include_libdir?: boolean;
}
