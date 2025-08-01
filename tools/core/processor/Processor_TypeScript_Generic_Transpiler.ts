import { BunPlatform_Glob_Match_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Match_Ex.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

/**
 * Scripts that match an include_pattern will be set as writable.\
 * Scripts that match both an include_pattern and an exclude_pattern will be set as not writable.\
 * Use Processor_Set_Writable to directly include or exclude file patterns for writing.
 *
 * @defaults
 * @param include_patterns `[]`
 * @param exclude_patterns `[]`
 * @param config.define `undefined`
 * @param config.target `"browser"`
 */
export function Processor_TypeScript_Generic_Transpiler(patterns: { include_patterns?: string[]; exclude_patterns?: string[] }, config?: Config): Builder.Processor {
  return new Class(patterns.include_patterns ?? [], patterns.exclude_patterns ?? [], config ?? {});
}
class Class implements Builder.Processor {
  ProcessorName = Processor_TypeScript_Generic_Transpiler.name;
  channel = Logger(this.ProcessorName).newChannel();

  constructor(
    readonly include_patterns: string[],
    readonly exclude_patterns: string[],
    readonly config: Config,
  ) {
    this.config.target ??= 'browser';
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      const src_path = NodePlatform_PathObject_Relative_Class(file.src_path).join();
      if (BunPlatform_Glob_Match_Ex(src_path, this.exclude_patterns, []) === true) {
        file.iswritable = false;
        continue;
      }
      if (BunPlatform_Glob_Match_Ex(src_path, this.include_patterns, []) === true) {
        file.iswritable = true;
        file.out_path = NodePlatform_PathObject_Relative_Class(file.out_path).replaceExt('.js').join();
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(file: Builder.File): Promise<void> {
    try {
      const text = await file.getText();
      const transpiled_text = await new Bun.Transpiler({
        define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
        loader: 'tsx',
        target: this.config.target,
        // disable any altering processes
        deadCodeElimination: false,
        inline: false,
        jsxOptimizationInline: false,
        minifyWhitespace: false,
        treeShaking: false,
        // necessary to remove type imports
        trimUnusedImports: true,
      }).transform(text);
      file.setText(transpiled_text);
    } catch (error) {
      this.channel.error(`ERROR: Builder.Processor: ${__filename}, File: ${file.src_path}`, error);
    }
  }
}
interface Config {
  define?: Options['define'] | (() => Options['define']);
  target?: Options['target'];
}
type Options = Bun.TranspilerOptions;
