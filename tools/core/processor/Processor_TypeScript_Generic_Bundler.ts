import { Core_Array_BinarySearch_InsertionIndex } from '../../../src/lib/ericchase/api.core.js';
import { BunPlatform_Glob_Match } from '../../../src/lib/ericchase/api.platform-bun.js';
import { NODE_PATH, NODE_URL, NodePlatform_File_Async_WriteText, NodePlatform_Path_GetExtension, NodePlatform_Path_GetParentPath, NodePlatform_Path_Join, NodePlatform_Path_JoinStandard, NodePlatform_Path_NewExtension, NodePlatform_Path_Slice } from '../../../src/lib/ericchase/api.platform-node.js';
import { Builder } from '../../core/Builder.js';
import { ClassLogger, Logger } from '../../core/Logger.js';

export const PATTERN = {
  MODULE: '.module{.ts,.tsx,.js,.jsx}',
  IIFE: '.iife{.ts,.tsx,.js,.jsx}',
  MODULE_IIFE: '{.module,.iife}{.ts,.tsx,.js,.jsx}',
  TS_TSX_JS_JSX: '{.ts,.tsx,.js,.jsx}',
};

interface Config {
  define?: Options['define'] | (() => Options['define']);
  env?: Options['env'];
  external?: Options['external'];
  sourcemap?: Options['sourcemap'];
  target?: Options['target'];
}
interface Extras {
  remap_imports?: boolean;
}

/**
 * External pattern cannot contain more than one "*" wildcard.
 * @defaults
 * @param config.define `undefined`
 * @param config.env `"disable"`
 * @param config.external `["*.module.js"]`
 * @param config.sourcemap `'none'`
 * @param config.target `'browser'`
 */
export function Processor_TypeScript_Generic_Bundler(config?: Config, extras?: Extras): Builder.Processor {
  return new Class(config ?? {}, extras ?? {});
}
class Class implements Builder.Processor {
  ProcessorName = Processor_TypeScript_Generic_Bundler.name;
  channel = Logger(this.ProcessorName).newChannel();

  bundle_set = new Set<Builder.File>();

  constructor(
    readonly config: Config,
    readonly extras: Extras,
  ) {
    this.config.env ??= 'disable';
    this.config.external ??= [];
    this.config.external.push('*.module.js');
    this.config.sourcemap ??= 'none';
    this.config.target ?? 'browser';
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path.toStandard();
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.MODULE}`)) {
        file.out_path.value = NodePlatform_Path_NewExtension(file.out_path.value, '.js');
        file.addProcessor(this, this.onProcessModule);
        this.bundle_set.add(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.IIFE}`)) {
        file.out_path.value = NodePlatform_Path_NewExtension(file.out_path.value, '.js');
        file.addProcessor(this, this.onProcessIIFEScript);
        this.bundle_set.add(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.TS_TSX_JS_JSX}`)) {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundle_set) {
        file.refresh();
      }
    }
  }
  async onRemove(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path.toStandard();
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.MODULE_IIFE}`)) {
        this.bundle_set.delete(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.TS_TSX_JS_JSX}`)) {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundle_set) {
        file.refresh();
      }
    }
  }

  async onProcessModule(file: Builder.File): Promise<void> {
    await processBuildResults(
      file,
      Bun.build({
        define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
        entrypoints: [file.src_path.value],
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
    await remapModuleImports(file, this.channel);
  }

  async onProcessIIFEScript(file: Builder.File): Promise<void> {
    await processBuildResults(
      file,
      Bun.build({
        define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
        entrypoints: [file.src_path.value],
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
async function processBuildResults(file: Builder.File, buildtask: Promise<Bun.BuildOutput>, channel: ClassLogger) {
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
                file.addUpstreamPath(path);
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
            await NodePlatform_File_Async_WriteText(NodePlatform_Path_Join(Builder.Dir.Out, artifact.path), text);
          }
        }
      }
    } else {
      channel.error(`File: ${file.src_path.value}, Warnings: [`);
      for (const log of results.logs) {
        channel.error(' ', log);
      }
      channel.error(']');
    }
  } catch (error) {
    channel.error(`File: ${file.src_path.value}, Errors: [`);
    if (error instanceof AggregateError) {
      for (const e of error.errors) {
        channel.error(' ', e);
      }
    } else {
      channel.error(error);
    }
    channel.error(']');
  }
}
async function remapModuleImports(file: Builder.File, channel: ClassLogger) {
  const text = await file.getText();
  // can't do lines, because import statements will become multiline if long enough
  const list_imports: { start: number; end: number; path: string }[] = [];
  const matches_imports = text.matchAll(/^import[ *{"'][\s\S]*?[ }"']from *["']([^"']*?)["'];$/dgm);
  for (const match of matches_imports) {
    if (match.indices !== undefined) {
      list_imports.push({ start: match.indices[1][0], end: match.indices[1][1], path: match[1] });
    }
  }
  if (list_imports.length > 0) {
    const list_sources: { start: number; end: number; path: string }[] = [];
    const matches_sources = text.matchAll(/^\/\/ (.*?)$/dgm);
    for (const match of matches_sources) {
      if (match.indices !== undefined) {
        list_sources.push({ start: match.indices[1][0], end: match.indices[1][1], path: match[1] });
      }
    }
    const text_parts: string[] = [];
    let text_index = 0;
    for (const item_import of list_imports) {
      const item_source = list_sources.at(Core_Array_BinarySearch_InsertionIndex(list_sources, item_import, (a, b) => a.start < b.start));
      if (item_source !== undefined) {
        try {
          const remapped_import_path = getRelativePath(file.src_path.value, item_source.path, item_import.path);
          text_parts.push(text.slice(text_index, item_import.start), remapped_import_path);
          text_index = item_import.end;
        } catch (error) {
          channel.log(`Skipping "${item_import.path}"`);
        }
      }
    }
    text_parts.push(text.slice(text_index));
    file.setText(text_parts.join(''));
  }
}
function getRelativePath(file_path: string, item_source_path: string, item_import_path: string) {
  if (item_import_path.startsWith('.') === true) {
    item_import_path = NodePlatform_Path_JoinStandard(NodePlatform_Path_GetParentPath(item_source_path), item_import_path);
  }
  let relative = NODE_PATH.relative(NodePlatform_Path_GetParentPath(file_path), NODE_URL.fileURLToPath(import.meta.resolve(item_import_path)));
  switch (NodePlatform_Path_GetExtension(relative)) {
    case '.js':
    case '.jsx':
    case '.ts':
    case '.tsx':
      relative = NodePlatform_Path_NewExtension(relative, '.js');
      break;
  }
  return NodePlatform_Path_Slice(relative, 0, 1) === '..' ? NodePlatform_Path_JoinStandard(relative) : `./${NodePlatform_Path_JoinStandard(relative)}`;
}
interface Config {
  define?: Options['define'] | (() => Options['define']);
  env?: Options['env'];
  external?: Options['external'];
  sourcemap?: Options['sourcemap'];
  target?: Options['target'];
}
interface Extras {
  remap_imports?: boolean;
}
type Options = Parameters<typeof Bun.build>[0];
