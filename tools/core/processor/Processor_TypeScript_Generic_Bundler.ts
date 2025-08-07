import { BunPlatform_Glob_Match } from '../../../src/lib/ericchase/BunPlatform_Glob_Match.js';
import { Core_Array_Binary_Search_Insertion_Index } from '../../../src/lib/ericchase/Core_Array_Binary_Search_Insertion_Index.js';
import { NODE_PATH, NODE_URL } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_File_Write_Text } from '../../../src/lib/ericchase/NodePlatform_File_Write_Text.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export const PATTERN = {
  MODULE: '{.module}{.ts,.tsx,.js,.jsx}',
  IIFE: '{.iife}{.ts,.tsx,.js,.jsx}',
  MODULE_IIFE: '{.module,.iife}{.ts,.tsx,.js,.jsx}',
  TS_TSX_JS_JSX: '{.ts,.tsx,.js,.jsx}',
};

/**
 * External pattern cannot contain more than one "*" wildcard.
 *
 * .module and .iife scripts will be set as writable.\
 * Non .module/.iife scripts will be set as not writable.\
 * Use Processor_Set_Writable to directly include or exclude file patterns for writing.
 *
 * @defaults
 * @param config.define `undefined`
 * @param config.env `"disable"`
 * @param config.external `["*.module.js"]`
 * @param config.sourcemap `'none'`
 * @param config.target `'browser'`
 * @param extras.remap_imports `true`
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
    this.config.target ??= 'browser';
    this.extras.remap_imports ??= true;
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.MODULE}`)) {
        file.iswritable = true;
        file.out_path = NodePlatform_PathObject_Relative_Class(file.out_path).replaceExt('.js').join();
        file.addProcessor(this, this.onProcessModule);
        this.bundle_set.add(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `**/*${PATTERN.IIFE}`)) {
        file.iswritable = true;
        file.out_path = NodePlatform_PathObject_Relative_Class(file.out_path).replaceExt('.js').join();
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
      const query = file.src_path;
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
    try {
      const results = await ProcessBuildResults(
        Bun.build({
          define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
          entrypoints: [file.src_path],
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
      );
      if (results.bundletext !== undefined) {
        // scan bundle text for source comment paths
        for (const [, ...paths] of results.bundletext.matchAll(/\n?\/\/ (src\/.*)\n?/g)) {
          for (const path of paths) {
            file.addUpstreamPath(path);
          }
        }
        // remap module imports in bundle text
        if (this.extras.remap_imports === true) {
          try {
            const remaptext = RemapModuleImports(file.src_path, results.bundletext, this.config.external);
            if (remaptext !== undefined) {
              file.setText(remaptext);
            } else {
              file.setText(results.bundletext);
            }
          } catch (error) {
            this.channel.error(error, 'Remap Error');
          }
        } else {
          file.setText(results.bundletext);
        }
      }
      // process other artifacts
      for (const artifact of results.artifacts) {
        switch (artifact.kind) {
          case 'entry-point':
            // handled above
            break;
          default:
            await Async_NodePlatform_File_Write_Text(NODE_PATH.join(NODE_PATH.dirname(file.out_path), artifact.path), await artifact.blob.text(), true);
            break;
        }
      }
    } catch (error) {
      this.channel.error(error, 'Module Bundle Error');
    }
  }
  async onProcessIIFEScript(file: Builder.File): Promise<void> {
    try {
      const results = await ProcessBuildResults(
        Bun.build({
          define: typeof this.config.define === 'function' ? this.config.define() : this.config.define,
          entrypoints: [file.src_path],
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
      );
      if (results.bundletext !== undefined) {
        // scan bundle text for source comment paths
        for (const [, ...paths] of results.bundletext.matchAll(/\n?\/\/ (src\/.*)\n?/g)) {
          for (const path of paths) {
            file.addUpstreamPath(path);
          }
        }
        file.setText(results.bundletext);
      }
      // process other artifacts
      for (const artifact of results.artifacts) {
        switch (artifact.kind) {
          case 'entry-point':
            // handled above
            break;
          default:
            await Async_NodePlatform_File_Write_Text(NODE_PATH.join(NODE_PATH.dirname(file.out_path), artifact.path), await artifact.blob.text(), true);
            break;
        }
      }
    } catch (error) {
      this.channel.error(error, 'IIFE Bundle Error');
    }
  }
}
type Options = Parameters<typeof Bun.build>[0];
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

class BuildArtifact {
  blob: Blob;
  hash: string | null;
  kind: 'entry-point' | 'chunk' | 'asset' | 'sourcemap' | 'bytecode';
  loader: 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'toml' | 'file' | 'napi' | 'wasm' | 'text' | 'css' | 'html';
  path: string;
  sourcemap: BuildArtifact | null;
  constructor(public artifact: Bun.BuildArtifact) {
    this.blob = artifact;
    this.hash = artifact.hash;
    this.kind = artifact.kind;
    this.loader = artifact.loader;
    this.path = artifact.path;
    this.sourcemap = artifact.sourcemap ? new BuildArtifact(artifact.sourcemap) : null;
  }
}
async function ProcessBuildResults(buildtask: Promise<Bun.BuildOutput>): Promise<{
  artifacts: BuildArtifact[];
  bundletext?: string;
  logs: Bun.BuildOutput['logs'];
  success: boolean;
}> {
  const buildresults = await buildtask;
  const out: {
    artifacts: BuildArtifact[];
    bundletext?: string;
    logs: Bun.BuildOutput['logs'];
    success: boolean;
  } = {
    artifacts: [],
    bundletext: undefined,
    logs: buildresults.logs,
    success: buildresults.success,
  };
  if (buildresults.success === true) {
    for (const artifact of buildresults.outputs) {
      switch (artifact.kind) {
        case 'entry-point': {
          out.bundletext = await artifact.text();
        }
      }
      out.artifacts.push(new BuildArtifact(artifact));
    }
  }
  return out;
}
function RemapModuleImports(filepath: string, filetext: string, external?: string[]): string | undefined {
  const set__external = new Set(external ?? []);
  // scan for import statements
  const array__import_statements: { start: number; end: number; path: string }[] = [];
  {
    // can't do lines, because import statements will become multiline if long enough
    const array__import_matches = filetext.matchAll(/^import[ *{"'][\s\S]*?[ }"']from *["']([^"']*?)["'];$/dgm);
    for (const match of array__import_matches) {
      if (match.indices !== undefined) {
        array__import_statements.push({ start: match.indices[1][0], end: match.indices[1][1], path: match[1] });
      }
    }
  }
  if (array__import_statements.length > 0) {
    // scan for source comments
    const array__source_comments: { start: number; end: number; path: string }[] = [];
    {
      // these will probably always be lines
      const array__source_matches = filetext.matchAll(/^\/\/ (.*?)$/dgm);
      for (const match of array__source_matches) {
        if (match.indices !== undefined) {
          array__source_comments.push({ start: match.indices[1][0], end: match.indices[1][1], path: match[1] });
        }
      }
    }
    if (array__source_comments.length > 0) {
      const srcpath = NODE_PATH.resolve(Builder.Dir.Src);
      const dirpath = NODE_PATH.parse(filepath).dir;
      // remap import statements
      const array__bundletext_parts: string[] = [];
      let index__bundletext_parts = 0;
      for (const import_statement of array__import_statements) {
        if (set__external.has(import_statement.path)) {
          continue;
        }

        // find the source_comment directly above the current import_statement
        const source_comment = array__source_comments.at(Core_Array_Binary_Search_Insertion_Index(array__source_comments, import_statement, (a, b) => a.start < b.start));
        if (source_comment !== undefined) {
          /**
           * Remap relative import path onto source path:
           * Example Bundle Text:
           * ```
           * // src/directory/module.ts
           * import { fn } from "../lib/a.js";
           * fn();
           * ```
           * Import path would be remapped into a project relative path:
           * "../lib/a.js" -> "./src/directory/../lib/a.js" -> "./src/lib/a.js".
           *
           */
          let resolved_path = '';
          try {
            if (import_statement.path.startsWith('.')) {
              // The import.meta.resolve api uses the current script file (this one) for resolving paths, which isn't what we want.
              // Instead, we'll use Node's resolve api to resolve the relative path using the source file's directory.
              resolved_path = NODE_PATH.resolve(NODE_PATH.dirname(source_comment.path), import_statement.path);
            } else {
              // Non-relative can be resolved using the import.meta.resolve api. If the file/module does not actually exist, an error will be thrown.
              // Node's fileURLToPath api will convert the resulting url path into a valid file path.
              try {
                const url = new URL(import.meta.resolve(import_statement.path));
                if (url.protocol === 'file:') {
                  resolved_path = NODE_URL.fileURLToPath(url);
                }
              } catch {}
            }
          } catch (error: any) {
            throw new Error(import_statement.path + '\n' + error);
          }
          if (resolved_path.startsWith(srcpath)) {
            // Convert resolved path into relative path
            // Import paths generally follow posix path rules, so we can convert to a posix relative path object here
            let relative_path_object = NodePlatform_PathObject_Relative_Class(NODE_PATH.relative(dirpath, resolved_path)).toPosix();
            // Set path extension to .js if the path is a script
            switch (relative_path_object.ext) {
              case '.ts':
              case '.tsx':
              case '.jsx':
                relative_path_object.replaceExt('.js');
                break;
            }
            // Convert path separators to /
            array__bundletext_parts.push(filetext.slice(index__bundletext_parts, import_statement.start), relative_path_object.join({ dot: true }));
            index__bundletext_parts = import_statement.end;
          }
        }
      }
      array__bundletext_parts.push(filetext.slice(index__bundletext_parts));
      return array__bundletext_parts.join('');
    }
  }
}
