import { Async_BunPlatform_File_Write_Text } from '../../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { BunPlatform_Glob_Match } from '../../../src/lib/ericchase/BunPlatform_Glob_Match.js';
import { BunPlatform_Glob_Match_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Match_Ex.js';
import { Core_Array_Binary_Search_Insertion_Index } from '../../../src/lib/ericchase/Core_Array_Binary_Search_Insertion_Index.js';
import { NODE_PATH, NODE_URL } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export const PATTERN = {
  IIFE_MODULE: '{.iife,.module}{.js,.jsx,.ts,.tsx}',
  IIFE: '{.iife}{.js,.jsx,.ts,.tsx}',
  JS_JSX_TS_TSX: '{.js,.jsx,.ts,.tsx}',
  MODULE: '{.module}{.js,.jsx,.ts,.tsx}',
};

/**
 * - Patterns in `config.external` may only contain a single `*` wildcard.
 * - Files that match a pattern in `extras.exclude_patterns` will be skipped.
 * - Files that match a pattern in `extras.include_patterns` but NOT in `extras.exclude_patterns` will be processed.
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
  ) {}
  async onStartUp(): Promise<void> {
    this.config.env ??= 'disable';
    this.config.external ??= [];
    this.config.external.push('*.module.js');
    this.config.sourcemap ??= 'none';
    this.config.target ??= 'browser';
    this.extras.bundler_mode ??= 'module';
    this.extras.exclude_patterns ??= [];
    this.extras.include_patterns ??= this.extras.bundler_mode === 'iife' ? [`**/*${PATTERN.IIFE}`] : [`**/*${PATTERN.MODULE}`];
    this.extras.remap_imports ??= true;

    for (let i = 0; i < this.extras.exclude_patterns.length; i++) {
      this.extras.exclude_patterns[i] = `${Builder.Dir.Src}/${this.extras.exclude_patterns[i]}`;
    }
    for (let i = 0; i < this.extras.include_patterns.length; i++) {
      this.extras.include_patterns[i] = `${Builder.Dir.Src}/${this.extras.include_patterns[i]}`;
    }
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match_Ex(query, this.extras.include_patterns ?? [], this.extras.exclude_patterns ?? []) === true) {
        file.iswritable = true;
        file.out_path = NodePlatform_PathObject_Relative_Class(file.out_path).replaceExt('.js').join();
        file.addProcessor(this, this.extras.bundler_mode === 'iife' ? this.onProcessIIFEScript : this.onProcessModule);
        this.bundle_set.add(file);
        continue;
      }
      if (BunPlatform_Glob_Match_Ex(query, [`${Builder.Dir.Src}/**/*${PATTERN.JS_JSX_TS_TSX}`], [`${Builder.Dir.Src}/**/*${PATTERN.IIFE_MODULE}`]) === true) {
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
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*${PATTERN.IIFE_MODULE}`)) {
        this.bundle_set.delete(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*${PATTERN.JS_JSX_TS_TSX}`)) {
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
      const define: Options['define'] = {};
      for (const [key, value] of Object.entries(this.config.define?.() ?? {})) {
        define[key] = value === undefined ? 'undefined' : JSON.stringify(value);
      }

      const results = await ProcessBuildResults(
        Bun.build({
          define,
          drop: this.config.drop,
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
            this.channel.error(error, `Remap Error, File: ${file.src_path}`);
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
            await Async_BunPlatform_File_Write_Text(NODE_PATH.join(NODE_PATH.parse(file.out_path).dir, artifact.path), await artifact.blob.text());
            break;
        }
      }
    } catch (error) {
      this.channel.error(error, `Module Bundle Error, File: ${file.src_path}`);
    }
  }
  async onProcessIIFEScript(file: Builder.File): Promise<void> {
    try {
      const define: Options['define'] = {};
      for (const [key, value] of Object.entries(this.config.define?.() ?? {})) {
        define[key] = value === undefined ? 'undefined' : JSON.stringify(value);
      }
      define['import.meta.url'] = 'undefined';

      const results = await ProcessBuildResults(
        Bun.build({
          define,
          drop: this.config.drop,
          entrypoints: [file.src_path],
          env: this.config.env,
          format: 'iife',
          minify: {
            identifiers: false,
            syntax: false,
            whitespace: false,
          },
          sourcemap: this.config.sourcemap,
          target: this.config.target,
          // add IIFE syntax around scripts
          // banner: '(() => {\n',
          // footer: '})();',
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
            await Async_BunPlatform_File_Write_Text(NODE_PATH.join(NODE_PATH.parse(file.out_path).dir, artifact.path), await artifact.blob.text());
            break;
        }
      }
    } catch (error) {
      this.channel.error(error, `IIFE Bundle Error, File: ${file.src_path}`);
    }
  }
}
type Options = Parameters<typeof Bun.build>[0];
interface Config {
  /**
   * Let's you define key value pairs as-is. The processor will call
   * `JSON.stringify(value)` for you.
   * @default undefined
   */
  define?: () => Record<string, any>;
  /**
   * Can only drop built-in and unbounded global identifiers, such as `console`
   * and `debugger`. Cannot drop any identifier that is defined in the final
   * bundle. The only real use case I've seen for this is removing debugger
   * statements and logging.
   * @default undefined */
  drop?: Options['drop'];
  /** @default 'disable' */
  env?: Options['env'];
  /**
   * Note: IIFE bundles do not have imports.
   * @default ['*.module.js']
   */
  external?: Options['external'];
  /** @default 'none' */
  sourcemap?: Options['sourcemap'];
  /** @default 'browser' */
  target?: Options['target'];
}
interface Extras {
  /** @default 'module' */
  bundler_mode?: 'iife' | 'module';
  /** @default [] */
  exclude_patterns?: string[];
  /**
   * Note: `|` is used here to work around JavaScript's multi-line comments. Use `/` instead.
   * @default
   * [`**|*${PATTERN.IIFE}`] when bundler_mode = 'iife'
   * [`**|*${PATTERN.MODULE}`] when bundler_mode = 'module'
   */
  include_patterns?: string[];
  /**
   * Note: IIFE bundles do not have imports.
   * @default true
   */
  remap_imports?: boolean;
}

class BuildArtifact {
  blob: Blob;
  hash: string | null;
  kind: 'entry-point' | 'chunk' | 'asset' | 'sourcemap' | 'bytecode';
  loader: 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'toml' | 'file' | 'napi' | 'wasm' | 'text' | 'css' | 'html';
  path: string;
  sourcemap: BuildArtifact | null;
  constructor(readonly artifact: Bun.BuildArtifact) {
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
          const resolved_path = ResolveImportPath(source_comment.path, import_statement.path);
          if (resolved_path?.startsWith(srcpath)) {
            // Convert resolved path into relative path
            // Import paths generally follow POSIX path rules, so we can convert to a POSIX relative path object here
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
function ResolveImportPath(source_path: string, import_path: string): string | undefined {
  try {
    if (import_path.startsWith('.')) {
      // The import.meta.resolve API uses the current script file (this one) for resolving paths, which isn't what we want.
      // Instead, we'll use Node's resolve API to resolve the relative path using the source file's directory.
      return NODE_PATH.resolve(NODE_PATH.parse(source_path).dir, import_path);
    } else {
      // Non-relative can be resolved using the import.meta.resolve API. If the file/module does not actually exist, an error will be thrown.
      // Node's fileURLToPath API will convert the resulting URL path into a valid file path.
      try {
        const url = new URL(import.meta.resolve(import_path));
        if (url.protocol === 'file:') {
          return NODE_URL.fileURLToPath(url);
        }
      } catch {}
    }
  } catch (error: any) {
    throw new Error(import_path + '\n' + error);
  }
}
