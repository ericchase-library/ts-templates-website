import { Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from 'tools/lib/Builder.js';

const logger = Logger(Processor_TypeScript_GenericBundler.name);

type BuildConfig = Pick<Parameters<typeof Bun.build>[0], 'external' | 'sourcemap' | 'target'>;

export function Processor_TypeScript_GenericBundler({ external = [], sourcemap = 'linked', target = 'browser' }: BuildConfig): ProcessorModule {
  return new CProcessor_TypeScript_GenericBundler({ external, sourcemap, target });
}

class CProcessor_TypeScript_GenericBundler implements ProcessorModule {
  channel = logger.newChannel();

  bundlefile_set = new Set<ProjectFile>();
  constructor(readonly config: Required<BuildConfig>) {}

  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>) {
    let trigger_reprocess = false;
    for (const file of files) {
      if (file.src_path.endsWith('.module.ts') || file.src_path.endsWith('.script.ts')) {
        file.out_path.ext = '.js';
        file.addProcessor(this, this.onProcess);
        this.bundlefile_set.add(file);
      } else if (file.src_path.ext === '.ts') {
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
      if (file.src_path.endsWith('.module.ts') || file.src_path.endsWith('.script.ts')) {
        this.bundlefile_set.delete(file);
      } else if (file.src_path.ext === '.ts') {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundlefile_set) {
        builder.reprocessFile(file);
      }
    }
  }

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    const build_results = await Bun.build({
      entrypoints: [file.src_path.raw],
      external: file.src_path.endsWith('.module.ts') ? this.config.external : [],
      format: 'esm',
      minify: {
        identifiers: false,
        syntax: false,
        whitespace: false,
      },
      sourcemap: this.config.sourcemap,
      target: this.config.target,
      // add iife around scripts
      banner: file.src_path.endsWith('.script.ts') ? '(() => {\n' : undefined,
      footer: file.src_path.endsWith('.script.ts') ? '})();' : undefined,
    });
    if (build_results.success === true) {
      for (const artifact of build_results.outputs) {
        switch (artifact.kind) {
          case 'entry-point':
            {
              const text = await artifact.text();
              file.setText(text);
              for (const [, ...paths] of text.matchAll(/\n?\/\/ (src\/.*)\n?/g)) {
                for (const path of paths) {
                  if (file.src_path.equals(path) === false) {
                    builder.addDependency(builder.getFile(Path(path)), file);
                  }
                }
              }
            }
            break;
          case 'sourcemap':
            // TODO: add virtual file to project manager
            // await Bun.write(file.out_file.newBase(new Path(artifact.path).base).path, await artifact.text());
            break;
        }
      }
    } else {
      this.channel.error(`ERROR: Processor: ${__filename}, File: ${file.src_path.raw}`);
      for (const log of build_results.logs) {
        this.channel.log(log.message);
      }
    }
  }
}
