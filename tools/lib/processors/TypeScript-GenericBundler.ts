import { IntoPattern, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { CLogger, Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_TypeScript_GenericBundler.name);

export const pattern = {
  module: '.module{.ts,.tsx,.js,.jsx}',
  iife: '.iife{.ts,.tsx,.js,.jsx}',
  moduleoriife: '{.module,.iife}{.ts,.tsx,.js,.jsx}',
  tstsxjsjsx: '{.ts,.tsx,.js,.jsx}',
};

type Options = Parameters<typeof Bun.build>[0];
interface Config {
  define?: Options['define'] | (() => Options['define']);
  env?: Options['env'];
  external?: Options['external'];
  sourcemap?: Options['sourcemap'];
  target?: Options['target'];
}

// External pattern cannot contain more than one "*" wildcard.
export function Processor_TypeScript_GenericBundler(config: Config): ProcessorModule {
  return new CProcessor_TypeScript_GenericBundler(config);
}

class CProcessor_TypeScript_GenericBundler implements ProcessorModule {
  channel = logger.newChannel();

  bundlefile_set = new Set<ProjectFile>();

  constructor(readonly config: Config) {
    this.config.env ??= 'disable';
    this.config.external ??= [];
    this.config.external.push('*.module.js');
    this.config.sourcemap ??= 'none';
    this.config.target ?? 'browser';
  }
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const file_pattern = IntoPattern(file.src_path);
      if (builder.platform.Utility.globMatch(file_pattern, `**/*${pattern.module}`)) {
        file.out_path.ext = '.js';
        file.addProcessor(this, this.onProcessModule);
        this.bundlefile_set.add(file);
        continue;
      }
      if (builder.platform.Utility.globMatch(file_pattern, `**/*${pattern.iife}`)) {
        file.out_path.ext = '.js';
        file.addProcessor(this, this.onProcessIIFEScript);
        this.bundlefile_set.add(file);
        continue;
      }
      if (builder.platform.Utility.globMatch(file_pattern, `**/*${pattern.tstsxjsjsx}`)) {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundlefile_set) {
        builder.reprocessFile(file);
      }
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const file_pattern = IntoPattern(file.src_path);
      if (builder.platform.Utility.globMatch(file_pattern, `**/*${pattern.moduleoriife}`)) {
        this.bundlefile_set.delete(file);
        continue;
      }
      if (builder.platform.Utility.globMatch(file_pattern, `**/*${pattern.tstsxjsjsx}`)) {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundlefile_set) {
        builder.reprocessFile(file);
      }
    }
  }

  async onProcessModule(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    await ProcessBunBuildResults(
      builder,
      file,
      Bun.build({
        define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
        entrypoints: [file.src_path.raw],
        env: this.config.env,
        external: this.config.external,
        format: 'esm',
        minify: {
          identifiers: false,
          syntax: false,
          whitespace: false,
        },
        sourcemap: this.config.sourcemap,
        target: this.config.target,
      }),
      this.channel,
    );
  }

  async onProcessIIFEScript(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    await ProcessBunBuildResults(
      builder,
      file,
      Bun.build({
        define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
        entrypoints: [file.src_path.raw],
        env: this.config.env,
        format: 'esm',
        minify: {
          identifiers: false,
          syntax: false,
          whitespace: false,
        },
        sourcemap: this.config.sourcemap,
        target: this.config.target,
        // add iife around scripts
        banner: '(() => {\n',
        footer: '})();',
      }),
      this.channel,
    );
  }
}

export async function ProcessBunBuildResults(builder: BuilderInternal, file: ProjectFile, buildtask: Promise<Bun.BuildOutput>, logchannel: CLogger) {
  try {
    const results = await buildtask;
    if (results.success === true) {
      for (const artifact of results.outputs) {
        switch (artifact.kind) {
          case 'entry-point': {
            const text = await artifact.text();
            file.setText(text);
            for (const [, ...paths] of text.matchAll(/\n?\/\/ (src\/.*)\n?/g)) {
              for (const path of paths) {
                if (file.src_path.equals(path) === false) {
                  builder.addDependency(builder.getFile(Path(path)), file);
                }
              }
            }
            break;
          }
          // for any non-code imports. there's probably a more elegant
          // way to do this, but this is temporary
          // case 'asset':
          // case 'sourcemap':
          default: {
            const text = await artifact.text();
            await builder.platform.File.writeText(Path(builder.dir.out, artifact.path), text);
          }
        }
      }
    } else {
      logchannel.error(`File: ${file.src_path.raw}, Warnings: [`);
      for (const log of results.logs) {
        logchannel.error(' ', log);
      }
      logchannel.error(']');
    }
  } catch (error) {
    logchannel.error(`File: ${file.src_path.raw}, Errors: [`);
    if (error instanceof AggregateError) {
      for (const e of error.errors) {
        logchannel.error(' ', e);
      }
    } else {
      logchannel.error(error);
    }
    logchannel.error(']');
  }
}
