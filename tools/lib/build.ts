import type { Subprocess } from 'bun';
import { AsyncLineReader } from '../../src/lib/ericchase/Algorithm/Stream/AsyncReader.js';
import { Broadcast } from '../../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { CopyFile } from '../../src/lib/ericchase/Platform/Bun/Fs.js';
import type { GlobManager } from '../../src/lib/ericchase/Platform/Bun/Glob.js';
import { type PathGroup, Path, PathGroupSet } from '../../src/lib/ericchase/Platform/Node/Path.js';
import { type NodeHTMLParser, ParseHTML } from '../../src/lib/ericchase/Platform/Web/HTML/ParseHTML.js';
import { CacheIsModified } from './cache.js';

// watching multiple files results in building each file when a change occurs
// in any. confirmed on windows via modification dates. this isn't the desired
// result. as an alternative, we can run separate builds for each target file.
// subprocesses.push(Bun.spawn(['bun', 'build', ...toBundle.paths, '--outdir', 'out/', '--external', '*.module.js', '--watch'], { stdout: 'pipe', stderr: 'inherit' }));
interface BuildParams {
  entry: PathGroup;
  external_imports?: string[];
  out_dir?: Path;
  sourcemap_mode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  watch?: boolean;
}
export class BuildRunner {
  broadcast = new Broadcast<void>();
  lines: string[] = [];
  subprocess_map = new Map<string, Subprocess<'ignore', 'pipe', 'inherit'>>();
  constructor(output: (data: string) => void) {
    let index = 0;
    this.broadcast.subscribe(() => {
      for (; index < this.lines.length; index++) {
        if (this.lines[index].length > 0) {
          output(this.lines[index]);
        }
      }
    });
  }
  add({ entry, external_imports = ['*.module.js'], out_dir = new Path('out'), sourcemap_mode = 'linked', watch = false }: BuildParams): Subprocess<'ignore', 'pipe', 'inherit'> | undefined {
    if (this.subprocess_map.has(entry.path)) {
      return;
    }
    const args = ['bun', 'build', entry.path, '--outdir', entry.newOrigin(out_dir).newBase('').path];
    for (const pattern of external_imports) {
      args.push('--external', pattern);
    }
    args.push(`--sourcemap=${sourcemap_mode}`);
    args.push('--target', 'browser');
    if (watch === true) {
      args.push('--watch');
    }
    const process = Bun.spawn(args, { stdout: 'pipe', stderr: 'inherit' });
    this.subprocess_map.set(entry.path, process);
    (async () => {
      for await (const lines of AsyncLineReader(process.stdout)) {
        for (const line of lines) {
          this.lines.push(line.trim());
        }
        this.broadcast.send();
      }
      this.subprocess_map.delete(entry.path);
    })();
    return process;
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
  out_dir?: Path;
  sourcemap_mode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  to_bundle: GlobManager;
  to_exclude?: GlobManager;
}
export async function bundle({ external_imports = [], out_dir = new Path('temp'), sourcemap_mode = 'linked', to_bundle, to_exclude }: BundleParams) {
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
  out_dir?: Path;
  to_compile: GlobManager;
  to_exclude?: GlobManager;
}
export async function compile({ out_dir = new Path('temp'), to_compile, to_exclude }: CompileParams) {
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
  out_dir?: Path;
  to_copy: GlobManager;
  to_exclude?: GlobManager;
}
export async function copy({ out_dir = new Path('build'), to_copy, to_exclude }: CopyParams) {
  const processed_paths = new PathGroupSet();
  const exclude_paths = new Set(to_exclude?.paths ?? []);
  for (const path_group of to_copy.path_groups) {
    if (await shouldProcess({ exclude_paths, src_path: path_group })) {
      await CopyFile({ from: path_group.path, to: path_group.newOrigin(out_dir).path });
      processed_paths.add(path_group);
    }
  }
  return processed_paths;
}

export interface HTMLPreprocessor {
  preprocess: (root: NodeHTMLParser.HTMLElement, html: string, path_group: PathGroup) => Promise<void>;
}
interface ProcessHTMLParams {
  out_dir?: Path;
  preprocessors: HTMLPreprocessor[];
  to_exclude?: GlobManager;
  to_process: GlobManager;
}
export async function processHTML({ out_dir = new Path('temp'), preprocessors, to_exclude, to_process }: ProcessHTMLParams) {
  const processed_paths = new PathGroupSet();
  const exclude_paths = new Set(to_exclude?.paths ?? []);
  for (const path_group of to_process.path_groups) {
    if (await shouldProcess({ exclude_paths, src_path: path_group })) {
      const html = await Bun.file(path_group.path).text();
      const root = ParseHTML(html, { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
      for (const preprocessor of preprocessors) {
        await preprocessor.preprocess(root, html, path_group);
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
  if (CacheIsModified(src_path) === true) {
    return true;
  }
  // skip it
  return false;
}
