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
  entry: PathGroup;
  external_imports?: string[];
  out_dir: Path;
  sourcemap_mode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  target?: Parameters<typeof Bun.build>[0]['target'];
  watch?: boolean;
}
export class BuildRunner {
  broadcast = new Broadcast<void>();
  lines: string[] = [];
  subprocess_map = new Map<string, SpawnerSubprocess>();
  constructor(output: (data: string) => void) {
    let index = 0;
    this.broadcast.subscribe(() => {
      for (; index < this.lines.length; index++) {
        if (this.lines[index].length > 0) {
          output(`Bundled: ${this.lines[index]}`);
        }
      }
    });
  }
  add({ entry, external_imports = ['*.module.js'], out_dir, sourcemap_mode = 'linked', target = 'browser', watch = false }: BuildParams): SpawnerSubprocess | undefined {
    if (this.subprocess_map.has(entry.path)) {
      return;
    }
    const args = ['build', entry.path, '--outdir', entry.newOrigin(out_dir).newBase('').path];
    for (const pattern of external_imports) {
      args.push('--external', pattern);
    }
    args.push(`--sourcemap=${sourcemap_mode}`);
    args.push('--target', target);
    if (watch === true) {
      args.push('--watch', '--no-clear-screen');
    }
    const child_process = Spawn.Bun(...args);
    this.subprocess_map.set(entry.path, child_process);
    const stderrReader = AsyncLineReader(child_process.stderr);
    const stdoutReader = AsyncLineReader(child_process.stdout);
    Promise.allSettled([
      (async () => {
        for await (const data of stderrReader) {
          ConsoleError('Bundler Error:', entry.path);
          ConsoleErrorToLines(data);
        }
      })(),
      (async () => {
        for await (const data of stdoutReader) {
          this.lines.push(...TrimLines(data));
          this.broadcast.send();
        }
      })(),
    ]).then(() => {
      this.subprocess_map.delete(entry.path);
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
        await Bun.write(path_group.newOrigin(out_dir).newExt('.js').path, outputs[0]);
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
        await Bun.write(path_group.newOrigin(out_dir).newExt('.js').path, output);
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
      let content = await Bun.file(path_group.path).text();
      for (const preprocessor of preprocessors) {
        try {
          if (preprocessor.pathMatches(path_group.path)) {
            const result = await preprocessor.preprocess(content);
            content = result.content;
          }
        } catch (error) {
          ConsoleError(error);
        }
      }
      for (const out_dir of out_dirs) {
        await Bun.write(path_group.newOrigin(out_dir).path, content);
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
  if (Cache_IsFileModified(src_path.path).data === true) {
    return true;
  }
  // skip it
  return false;
}

export function IntoPatterns(...parts: (string | string[])[]): string[] {
  return [...nCartesianProduct(...parts.map((part) => (Array.isArray(part) ? part : [part])))].map((arr) => arr.join(''));
}
