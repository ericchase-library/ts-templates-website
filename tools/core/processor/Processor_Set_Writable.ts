import { BunPlatform_Glob_Match_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Match_Ex.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

/**
 * - Files that match a pattern in `config.exclude_patterns` will be skipped.
 * - Files that match a pattern in `config.include_patterns` but NOT in `config.exclude_patterns` will be marked either writable or not writable depending on `config.value`.
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
  ) {}
  async onStartUp(): Promise<void> {
    this.config.exclude_patterns ??= [];
    this.config.include_patterns ??= [];
    this.config.value ??= true;
    this.extras.exclude_lib ??= true;

    for (let i = 0; i < this.config.exclude_patterns.length; i++) {
      this.config.exclude_patterns[i] = `${Builder.Dir.Src}/${this.config.exclude_patterns[i]}`;
    }
    for (let i = 0; i < this.config.include_patterns.length; i++) {
      this.config.include_patterns[i] = `${Builder.Dir.Src}/${this.config.include_patterns[i]}`;
    }
    if (this.extras.exclude_lib === true) {
      this.config.exclude_patterns.push(`${Builder.Dir.Lib}/**`);
    }
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      if (BunPlatform_Glob_Match_Ex(file.src_path, this.config.include_patterns ?? [], this.config.exclude_patterns ?? []) === true) {
        file.iswritable = this.config.value ?? true;
      }
    }
  }
}
interface Config {
  /** @default [] */
  exclude_patterns?: string[];
  /** @default [] */
  include_patterns?: string[];
  /**
   * If `true`, mark file as writable. If `false`, mark file as not writable.
   * @default true
   */
  value?: boolean;
}
interface Extras {
  /**
   * If `true`, this instance of `Processor_Set_Writable` will skip files under `Builder.Dir.Lib`.
   * @default true
   */
  exclude_lib?: boolean;
}
