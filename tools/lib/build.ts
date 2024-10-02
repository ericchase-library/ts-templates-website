import { nCartesianProduct } from '../../src/lib/ericchase/Algorithm/Math/CartesianProduct.js';
import { AsyncLineReader } from '../../src/lib/ericchase/Algorithm/Stream.js';
import { Broadcast } from '../../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { type SpawnerSubprocess, Spawn } from '../../src/lib/ericchase/Platform/Bun/Child Process.js';
import type { GlobScanner } from '../../src/lib/ericchase/Platform/Bun/Glob.js';
import { ParseHTML } from '../../src/lib/ericchase/Platform/Node/HTML Processor/ParseHTML.js';
import { type Path, type PathGroup, PathGroupSet } from '../../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleError, ConsoleErrorToLines } from '../../src/lib/ericchase/Utility/Console.js';
import { TrimLines } from '../../src/lib/ericchase/Utility/String.js';
import { Cache_IsFileModified } from './cache/FileStatsCache.js';
import type { FilePreprocessor } from './preprocessors/FilePreprocessor.js';
import type { HTMLPreprocessor } from './preprocessors/HTMLPreprocessor.js';

// watching multiple files results in building each file when a change occurs
// in any. confirmed on windows via modification dates. this isn't the desired
// result. as an alternative, we can run separate builds for each target file.
// subprocesses.push(Bun.spawn(['bun', 'build', ...toBundle.paths, '--outdir', 'out/', '--external', '*.module.js', '--watch'], { stdout: 'pipe', stderr: 'inherit' }));
interface BuildParams {
  entrypoint: PathGroup;
  outdir: Path;
  target?: Parameters<typeof Bun.build>[0]['target'];
  format?: Parameters<typeof Bun.build>[0]['format'];
  sourcemap?: Parameters<typeof Bun.build>[0]['sourcemap'];
  minify?: Parameters<typeof Bun.build>[0]['minify'];
  external?: Parameters<typeof Bun.build>[0]['external'];
  define?: Record<string, any>;
  watch?: boolean;
}
export class BuildRunner {
  broadcast = new Broadcast<void>();
  output: string[] = [];
  subprocess_map = new Map<string, SpawnerSubprocess>();
  add({ entrypoint, outdir, target = 'browser', format = 'esm', sourcemap = 'none', minify = false, external = ['*.module.js'], define = {}, watch = false }: BuildParams): SpawnerSubprocess | undefined {
    if (this.subprocess_map.has(entrypoint.path)) {
      return;
    }
    const args = ['build', '--entrypoints', entrypoint.path, '--outdir', entrypoint.newOrigin(outdir).newRelativeBase('').path];
    args.push('--target', target);
    args.push('--format', format);
    args.push(`--sourcemap=${sourcemap}`);
    if (minify === true) {
      args.push('--minify');
    } else if (typeof minify !== 'boolean') {
      for (const [key, value] of Object.entries(minify)) {
        if (value === true) {
          args.push(`--minify-${key}`);
        }
      }
    }
    for (const pattern of external) {
      args.push('--external', pattern);
    }
    for (const [key, value] of Object.entries(define)) {
      args.push('--define', `${key}=${JSON.stringify(value)}`);
    }
    if (watch === true) {
      args.push('--watch', '--no-clear-screen');
    }
    const child_process = Spawn.Bun(...args);
    this.subprocess_map.set(entrypoint.path, child_process);
    const stderrReader = AsyncLineReader(child_process.stderr);
    const stdoutReader = AsyncLineReader(child_process.stdout);
    Promise.allSettled([
      (async () => {
        for await (const data of stderrReader) {
          ConsoleError('Bundler Error:', entrypoint.path);
          ConsoleErrorToLines(data);
        }
      })(),
      (async () => {
        for await (const data of stdoutReader) {
          this.output.push(...TrimLines(data));
          this.broadcast.send();
        }
      })(),
    ]).then(() => {
      this.subprocess_map.delete(entrypoint.path);
    });
    return child_process;
  }
  killAll() {
    for (const [_, process] of this.subprocess_map) {
      process.kill();
    }
    this.subprocess_map.clear();
  }
}

interface BundleParams {
  external_imports?: string[];
  out_dir: Path;
  sourcemap_mode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  to_bundle: GlobScanner;
  to_exclude?: GlobScanner;
}
export async function bundle({ external_imports = [], out_dir, sourcemap_mode = 'linked', to_bundle, to_exclude }: BundleParams) {
  const processed_paths = new PathGroupSet();
  const exclude_paths = new Set(to_exclude?.paths ?? []);
  for (const path_group of to_bundle.path_groups) {
    if (await shouldProcess({ exclude_paths, src_path: path_group })) {
      const { outputs, success } = await Bun.build({
        entrypoints: [path_group.path],
        external: external_imports,
        minify: false,
        sourcemap: sourcemap_mode,
        splitting: false,
        target: 'browser',
      });
      if (success) {
        await Bun.write(path_group.newOrigin(out_dir).newRelativeExt('.js').path, outputs[0]);
        processed_paths.add(path_group);
      }
    }
  }
  return processed_paths;
}

interface CompileParams {
  out_dir: Path;
  to_compile: GlobScanner;
  to_exclude?: GlobScanner;
}
export async function compile({ out_dir, to_compile, to_exclude }: CompileParams) {
  const processed_paths = new PathGroupSet();
  const exclude_paths = new Set(to_exclude?.paths ?? []);
  const transpiler = new Bun.Transpiler({
    loader: 'tsx',
    minifyWhitespace: false,
    target: 'browser',
  });
  for (const path_group of to_compile.path_groups) {
    if (await shouldProcess({ exclude_paths, src_path: path_group })) {
      try {
        const output = await transpiler.transform(await Bun.file(path_group.path).text());
        await Bun.write(path_group.newOrigin(out_dir).newRelativeExt('.js').path, output);
        processed_paths.add(path_group);
      } catch (error) {}
    }
  }
  return processed_paths;
}

interface CopyParams {
  out_dirs: Path[];
  preprocessors?: FilePreprocessor[];
  to_copy: GlobScanner;
  to_exclude?: GlobScanner;
}
export async function copy({ out_dirs, preprocessors = [], to_copy, to_exclude }: CopyParams) {
  const processed_paths = new PathGroupSet();
  const exclude_paths = new Set(to_exclude?.paths ?? []);
  for (const path_group of to_copy.path_groups) {
    if (await shouldProcess({ exclude_paths, src_path: path_group })) {
      let bytes = await Bun.file(path_group.path).bytes();
      for (const preprocessor of preprocessors) {
        try {
          if (preprocessor.pathMatches(path_group)) {
            const result = await preprocessor.preprocess(bytes);
            bytes = result.bytes;
          }
        } catch (error) {
          ConsoleError(error);
        }
      }
      for (const out_dir of out_dirs) {
        await Bun.write(path_group.newOrigin(out_dir).path, bytes);
      }
      processed_paths.add(path_group);
    }
  }
  return processed_paths;
}

interface ProcessHTMLParams {
  out_dir: Path;
  preprocessors: HTMLPreprocessor[];
  to_exclude?: GlobScanner;
  to_process: GlobScanner;
}
export async function processHTML({ out_dir, preprocessors, to_exclude, to_process }: ProcessHTMLParams) {
  const processed_paths = new PathGroupSet();
  const exclude_paths = new Set(to_exclude?.paths ?? []);
  for (const path_group of to_process.path_groups) {
    if (await shouldProcess({ exclude_paths, src_path: path_group })) {
      const html = await Bun.file(path_group.path).text();
      const root = ParseHTML(html, { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
      for (const preprocessor of preprocessors) {
        try {
          await preprocessor.preprocess(root, html, path_group);
        } catch (error) {
          ConsoleError(error);
        }
      }
      await Bun.write(path_group.newOrigin(out_dir).path, root.toString());
      processed_paths.add(path_group);
    }
  }
  return processed_paths;
}

async function shouldProcess({ exclude_paths, src_path }: { exclude_paths: Set<string>; src_path: Path | PathGroup }): Promise<boolean> {
  // condition order matters
  // skip any excluded paths right away
  if (exclude_paths.has(src_path.path) === true) {
    return false;
  }
  // source file is modified, process it
  if (Cache_IsFileModified(src_path).data === true) {
    return true;
  }
  // skip it
  return false;
}

export function IntoPatterns(...parts: (string | string[])[]): string[] {
  return [...nCartesianProduct(...parts.map((part) => (Array.isArray(part) ? part : [part])))].map((arr) => arr.join(''));
}
