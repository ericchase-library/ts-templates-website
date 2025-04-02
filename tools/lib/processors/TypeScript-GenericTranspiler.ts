import { CPath, IntoPattern } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { globMatch } from '../../../src/lib/ericchase/Platform/Glob_Utility.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_TypeScript_GenericTranspiler.name);

type Options = Bun.TranspilerOptions;
interface Config {
  define?: Options['define'] | (() => Options['define']);
  target?: Options['target'];
}

export function Processor_TypeScript_GenericTranspiler(include_patterns: (CPath | string)[], exclude_patterns: (CPath | string)[], config: Config): ProcessorModule {
  return new CProcessor_TypeScript_GenericTranspiler(
    include_patterns.map((pattern) => IntoPattern(pattern)),
    exclude_patterns.map((pattern) => IntoPattern(pattern)),
    config,
  );
}

class CProcessor_TypeScript_GenericTranspiler implements ProcessorModule {
  channel = logger.newChannel();

  constructor(
    readonly include_patterns: string[],
    readonly exclude_patterns: string[],
    readonly config: Config,
  ) {}
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    for (const file of files) {
      if (globMatch(builder.platform, IntoPattern(file.src_path), this.include_patterns, this.exclude_patterns) === true) {
        file.out_path.ext = '.js';
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
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
      this.channel.error(`ERROR: Processor: ${__filename}, File: ${file.src_path.raw}`, error);
    }
  }
}
