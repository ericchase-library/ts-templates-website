import { BunPlatform_Glob_Ex_Match } from '../../../src/lib/ericchase/api.platform-bun.js';
import { NodePlatform_Path_NewExtension } from '../../../src/lib/ericchase/api.platform-node.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

/**
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
  ) {}
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      if (BunPlatform_Glob_Ex_Match(file.src_path.toStandard(), this.include_patterns, this.exclude_patterns) === true) {
        file.out_path.value = NodePlatform_Path_NewExtension(file.out_path.value, '.js');
        file.iswritable = true;
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
        target: this.config.target ?? 'browser',
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
      this.channel.error(`ERROR: Builder.Processor: ${__filename}, File: ${file.src_path.value}`, error);
    }
  }
}
interface Config {
  define?: Options['define'] | (() => Options['define']);
  target?: Options['target'];
}
type Options = Bun.TranspilerOptions;
