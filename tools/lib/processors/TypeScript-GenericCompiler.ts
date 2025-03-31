import { CPath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { globMatch } from '../../../src/lib/ericchase/Platform/Glob_Utility.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_TypeScript_GenericCompiler.name);

type BuildConfig = Pick<Parameters<typeof Bun.build>[0], 'define' | 'target'>;

export function Processor_TypeScript_GenericCompiler(include_patterns: (CPath | string)[], exclude_patterns: (CPath | string)[], { define = {}, target = 'browser' }: BuildConfig = {}): ProcessorModule {
  return new CProcessor_TypeScript_GenericCompiler(
    include_patterns.map((pattern) => Path(pattern).standard),
    exclude_patterns.map((pattern) => Path(pattern).standard),
    { define, target },
  );
}

class CProcessor_TypeScript_GenericCompiler implements ProcessorModule {
  channel = logger.newChannel();

  transpiler: import('bun').Transpiler;

  constructor(
    readonly include_patterns: string[],
    readonly exclude_patterns: string[],
    readonly config: Required<BuildConfig>,
  ) {
    this.transpiler = new Bun.Transpiler({
      define: this.config.define,
      loader: 'tsx',
      target: this.config.target,
      // disable any altering processes
      deadCodeElimination: false,
      inline: false,
      jsxOptimizationInline: false,
      minifyWhitespace: false,
      treeShaking: false,
      // this is ok
      trimUnusedImports: true,
    });
  }
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    for (const file of files) {
      if (globMatch(builder.platform, file.src_path.standard, this.include_patterns, this.exclude_patterns) === true) {
        file.out_path.ext = '.js';
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    try {
      file.setText(await this.transpiler.transform(await file.getText()));
    } catch (error) {
      this.channel.error(`ERROR: Processor: ${__filename}, File: ${file.src_path.raw}`, error);
    }
  }
}
