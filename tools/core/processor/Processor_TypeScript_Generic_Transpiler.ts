import { BunPlatform_Glob_Match_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Match_Ex.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { PATTERN } from './Processor_TypeScript_Generic_Bundler.js';

/**
 * - Files that match a pattern in `extras.exclude_patterns` will be skipped.
 * - Files that match a pattern in `extras.include_patterns` but NOT in `extras.exclude_patterns` will be processed.
 */
export function Processor_TypeScript_Generic_Transpiler(config?: Config, extras?: Extras): Builder.Processor {
  return new Class(config ?? {}, extras ?? {});
}
class Class implements Builder.Processor {
  ProcessorName = Processor_TypeScript_Generic_Transpiler.name;
  channel = Logger(this.ProcessorName).newChannel();

  constructor(
    readonly config: Config,
    readonly extras: Extras,
  ) {}
  async onStartUp(): Promise<void> {
    this.config.target ??= 'browser';
    this.extras.exclude_patterns ??= [];
    this.extras.include_patterns ??= [`**/*${PATTERN.JS_JSX_TS_TSX}`];

    for (let i = 0; i < this.extras.exclude_patterns.length; i++) {
      this.extras.exclude_patterns[i] = `${Builder.Dir.Src}/${this.extras.exclude_patterns[i]}`;
    }
    for (let i = 0; i < this.extras.include_patterns.length; i++) {
      this.extras.include_patterns[i] = `${Builder.Dir.Src}/${this.extras.include_patterns[i]}`;
    }
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match_Ex(query, this.extras.include_patterns ?? [], this.extras.exclude_patterns ?? []) === true) {
        file.iswritable = true;
        file.out_path = NodePlatform_PathObject_Relative_Class(file.out_path).replaceExt('.js').join();
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(file: Builder.File): Promise<void> {
    try {
      const define: Options['define'] = {};
      for (const [key, value] of Object.entries(this.config.define?.() ?? {})) {
        define[key] = value === undefined ? 'undefined' : JSON.stringify(value);
      }

      const text = await file.getText();
      const transpiled_text = await new Bun.Transpiler({
        define,
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
      this.channel.error(error, `Transpiler Error, File: ${file.src_path}`);
    }
  }
}
type Options = Bun.TranspilerOptions;
interface Config {
  /** @default undefined */
  define?: () => Record<string, any>;
  /** @default 'browser' */
  target?: Options['target'];
}
interface Extras {
  /** @default [] */
  exclude_patterns?: string[];
  /**
   * Note: `|` is used here to work around JavaScript's multi-line comments. Use `/` instead.
   * @default
   * [`**|*${PATTERN.JS_JSX_TS_TSX}`]
   */
  include_patterns?: string[];
}
