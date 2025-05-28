import { BunPlatform_Glob_Ex_Match } from '../../../src/lib/ericchase/api.platform-bun.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

/**
 * @defaults
 * @param include_patterns `[]`
 * @param exclude_patterns `[]`
 * @param config.exclude_libdir `true`
 */
export function Processor_Set_Writable(patterns: { include_patterns?: string[]; exclude_patterns?: string[] }, config?: Config): Builder.Processor {
  return new Class(patterns.include_patterns ?? [], patterns.exclude_patterns ?? [], config ?? {});
}
class Class implements Builder.Processor {
  ProcessorName = Processor_Set_Writable.name;
  channel = Logger(this.ProcessorName).newChannel();

  constructor(
    readonly include_patterns: string[],
    readonly exclude_patterns: string[],
    readonly config: Config,
  ) {
    this.config.exclude_libdir ??= true;
  }
  async onStartUp(): Promise<void> {
    if (this.config.exclude_libdir === true) {
      this.exclude_patterns.push(`${Builder.Dir.Lib}/**/*`);
    }
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      if (BunPlatform_Glob_Ex_Match(file.src_path.toStandard(), this.include_patterns, []) === true) {
        file.iswritable = true;
      }
      if (BunPlatform_Glob_Ex_Match(file.src_path.toStandard(), this.exclude_patterns, []) === true) {
        file.iswritable = false;
      }
    }
  }
}
interface Config {
  exclude_libdir?: boolean;
}
