import type { Subprocess } from 'bun';

import { AsyncLineReader } from '../../src/lib/ericchase/Algorithm/Stream/AsyncReader.js';
import { Broadcast } from '../../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { CopyFile } from '../../src/lib/ericchase/Platform/Bun/Fs.js';
import { type GlobManager, PathGroup, PathManager } from '../../src/lib/ericchase/Platform/Bun/Path.js';
import { type NodeHTMLParser, ParseHTML } from '../../src/lib/ericchase/Platform/Web/HTML/ParseHTML.js';
import { CacheIsModified } from './cache.js';

// watching multiple files results in building each file when a change occurs
// in any. confirmed on windows via modification dates. this isn't the desired
// result. as an alternative, we can run separate builds for each target file.
// subprocesses.push(Bun.spawn(['bun', 'build', ...toBundle.paths, '--outdir', 'out/', '--external', '*.module.js', '--watch'], { stdout: 'pipe', stderr: 'pipe' }));
interface BuildParams {
  entry: PathGroup;
  externalImports?: string[];
  outDir?: string;
  sourcemapMode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  watch?: boolean;
}
export class BuildRunner {
  broadcast = new Broadcast<void>();
  lines: string[] = [];
  subprocessMap = new Map<string, Subprocess<'ignore', 'pipe', 'pipe'>>();
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
  abort() {
    for (const [_, process] of this.subprocessMap) {
      process.kill();
    }
  }
  build({ entry, externalImports = ['*.module.js'], outDir = 'out', sourcemapMode = 'linked', watch = false }: BuildParams): Subprocess<'ignore', 'pipe', 'pipe'> | undefined {
    if (this.subprocessMap.has(entry.path)) {
      return;
    }
    const args = ['bun', 'build', entry.path, '--outdir', PathGroup.new({ basedir: outDir, path: entry.dir }).path];
    for (const pattern of externalImports) {
      args.push('--external', pattern);
    }
    args.push(`--sourcemap=${sourcemapMode}`);
    args.push('--target', 'browser');
    if (watch === true) {
      args.push('--watch');
    }
    const process = Bun.spawn(args, { stdout: 'pipe', stderr: 'pipe' });
    this.subprocessMap.set(entry.path, process);
    (async () => {
      for await (const lines of AsyncLineReader(process.stdout)) {
        for (const line of lines) {
          this.lines.push(line.trim());
        }
        this.broadcast.send();
      }
      this.subprocessMap.delete(entry.path);
    })();
    return process;
  }
  watch({ entry, externalImports = ['*.module.js'], outDir = 'out', sourcemapMode = 'linked' }: BuildParams): Subprocess<'ignore', 'pipe', 'pipe'> | undefined {
    return this.build({
      entry,
      externalImports,
      outDir,
      sourcemapMode,
      watch: true,
    });
  }
}

//
//
//

interface BundleParams {
  externalImports?: string[];
  outDir?: string;
  sourcemapMode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  toBundle: GlobManager;
  toExclude?: GlobManager;
}
export async function bundle({ externalImports = [], outDir = './temp', sourcemapMode = 'linked', toBundle, toExclude }: BundleParams) {
  const processedPaths = new PathManager();
  const excludePaths = new Set(toExclude?.paths ?? []);
  for (const globGroup of toBundle.globGroups) {
    for (const pathGroup of globGroup.pathGroups) {
      const srcPath = pathGroup.path;
      const outPath = pathGroup.replaceBasedir(outDir).replaceExt('.js').path;
      if (await shouldProcess({ excludePaths, srcPath, outPath })) {
        const { outputs, success } = await Bun.build({
          entrypoints: [srcPath],
          external: externalImports,
          minify: false,
          sourcemap: sourcemapMode,
          splitting: false,
          target: 'browser',
        });
        if (success) {
          await Bun.write(outPath, outputs[0]);
          processedPaths.addGroup(pathGroup);
        }
      }
    }
  }
  return processedPaths;
}

interface CompileParams {
  outDir?: string;
  toCompile: GlobManager;
  toExclude?: GlobManager;
}
export async function compile({ outDir = './temp', toCompile, toExclude }: CompileParams) {
  const processedPaths = new PathManager();
  const excludePaths = new Set(toExclude?.paths ?? []);
  const transpiler = new Bun.Transpiler({
    loader: 'tsx',
    minifyWhitespace: false,
    target: 'browser',
  });
  for (const globGroup of toCompile.globGroups) {
    for (const pathGroup of globGroup.pathGroups) {
      const srcPath = pathGroup.path;
      const outPath = pathGroup.replaceBasedir(outDir).replaceExt('.js').path;
      if (await shouldProcess({ excludePaths, srcPath, outPath })) {
        try {
          const output = await transpiler.transform(await Bun.file(srcPath).text());
          await Bun.write(outPath, output);
          processedPaths.addGroup(pathGroup);
        } catch (error) {}
      }
    }
  }
  return processedPaths;
}

interface CopyParams {
  outDir?: string;
  toCopy: GlobManager;
  toExclude?: GlobManager;
}
export async function copy({ outDir = './build', toCopy, toExclude }: CopyParams) {
  const processedPaths = new PathManager();
  const excludePaths = new Set(toExclude?.paths ?? []);
  for (const pathGroup of toCopy.pathGroups) {
    const srcPath = pathGroup.path;
    const outPath = pathGroup.replaceBasedir(outDir).path;
    if (await shouldProcess({ excludePaths, srcPath, outPath })) {
      await CopyFile({
        from: srcPath,
        to: outPath,
      });
      processedPaths.addGroup(pathGroup);
    }
  }
  return processedPaths;
}

export interface HTMLPreprocessor {
  preprocess: (root: NodeHTMLParser.HTMLElement, html: string, pathGroup: PathGroup) => Promise<void>;
}
interface ProcessHTMLParams {
  outDir?: string;
  preprocessors: HTMLPreprocessor[];
  toExclude?: GlobManager;
  toProcess: GlobManager;
}
export async function processHTML({ outDir = './temp', preprocessors, toExclude, toProcess }: ProcessHTMLParams) {
  const processedPaths = new PathManager();
  const excludePaths = new Set(toExclude?.paths ?? []);
  for (const globGroup of toProcess.globGroups) {
    for (const pathGroup of globGroup.pathGroups) {
      const srcPath = pathGroup.path;
      const outPath = pathGroup.replaceBasedir(outDir).path;
      if (await shouldProcess({ excludePaths, srcPath, outPath })) {
        const html = await Bun.file(srcPath).text();
        const root = ParseHTML(html, { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
        for (const preprocessor of preprocessors) {
          await preprocessor.preprocess(root, html, pathGroup);
        }
        await Bun.write(outPath, root.toString());
        processedPaths.addGroup(pathGroup);
      }
    }
  }
  return processedPaths;
}

async function shouldProcess({ excludePaths, outPath, srcPath }: { excludePaths: Set<string>; outPath: string; srcPath: string }): Promise<boolean> {
  // condition order matters
  // skip any excluded paths right away
  if (excludePaths.has(srcPath) === true) {
    return false;
  }
  // source file is modified, process it
  if (CacheIsModified(srcPath) === true) {
    return true;
  }
  // out file doesn't exist, process it
  if ((await Bun.file(outPath).exists()) === false) {
    return true;
  }
  // skip it
  return false;
}
