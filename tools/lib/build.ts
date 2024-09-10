import { CopyFile } from '../../src/lib/ericchase/Platform/Bun/Fs.js';
import { GlobManager, PathGroup } from '../../src/lib/ericchase/Platform/Bun/Path.js';
import { type NodeHTMLParser, ParseHTML } from '../../src/lib/ericchase/Platform/Web/HTML/ParseHTML.js';

interface BundleParams {
  externalImports?: string[];
  outDir?: string;
  sourcemapMode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  toBundle: GlobManager;
  toExclude?: GlobManager;
}
export async function bundle({ externalImports = [], outDir = './temp', sourcemapMode = 'inline', toBundle, toExclude }: BundleParams) {
  const toCopy = new GlobManager();
  const excludePaths = new Set(toExclude?.paths ?? []);
  for (const globGroup of toBundle.globGroups) {
    for (const pathGroup of globGroup.pathGroups) {
      if (!excludePaths.has(pathGroup.path)) {
        const { outputs, success } = await Bun.build({
          entrypoints: [pathGroup.path],
          external: externalImports,
          minify: false,
          sourcemap: sourcemapMode,
          splitting: false,
          target: 'browser',
        });
        if (success) {
          await Bun.write(pathGroup.replaceBasedir(outDir).replaceExt('.js').path, outputs[0]);
          toCopy.scan(outDir, pathGroup.replaceBasedir('').replaceExt('.js').path);
        }
      }
    }
  }
  return toCopy;
}

interface CompileParams {
  outDir?: string;
  sourcemapMode?: Parameters<typeof Bun.build>[0]['sourcemap'];
  toCompile: GlobManager;
  toExclude?: GlobManager;
}
export async function compile({ outDir = './temp', sourcemapMode = 'inline', toCompile, toExclude }: CompileParams) {
  const toCopy = new GlobManager();
  const excludePaths = new Set(toExclude?.paths ?? []);

  const transpiler = new Bun.Transpiler({
    loader: 'tsx',
    minifyWhitespace: false,
    target: 'browser',
  });

  for (const globGroup of toCompile.globGroups) {
    for (const pathGroup of globGroup.pathGroups) {
      if (!excludePaths.has(pathGroup.path)) {
        try {
          const output = await transpiler.transform(await Bun.file(pathGroup.path).text());
          await Bun.write(pathGroup.replaceBasedir(outDir).replaceExt('.js').path, output);
          toCopy.scan(outDir, pathGroup.replaceBasedir('').replaceExt('.js').path);
        } catch (error) {}
      }
    }
  }
  return toCopy;
}

interface CopyParams {
  outDir?: string;
  toCopy: GlobManager;
  toExclude?: GlobManager;
}
export async function copy({ outDir = './build', toCopy, toExclude }: CopyParams) {
  const excludePaths = new Set(toExclude?.paths ?? []);
  for (const pathGroup of toCopy.pathGroups) {
    if (!excludePaths.has(pathGroup.path)) {
      await CopyFile({
        from: pathGroup.path,
        to: pathGroup.replaceBasedir(outDir).path,
      });
    }
  }
}

export type HTMLPreprocessor = (root: NodeHTMLParser.HTMLElement, html: string, pathGroup: PathGroup) => Promise<void>;
interface ProcessHTMLParams {
  outDir?: string;
  preprocessors: HTMLPreprocessor[];
  toExclude?: GlobManager;
  toProcess: GlobManager;
}
export async function processHTML({ outDir = './temp', preprocessors, toExclude, toProcess }: ProcessHTMLParams) {
  const toCopy = new GlobManager();
  const excludePaths = new Set(toExclude?.paths ?? []);
  for (const globGroup of toProcess.globGroups) {
    for (const pathGroup of globGroup.pathGroups) {
      if (!excludePaths.has(pathGroup.path)) {
        const html = await Bun.file(pathGroup.path).text();
        const root = ParseHTML(html, { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
        for (const preprocessor of preprocessors) {
          await preprocessor(root, html, pathGroup);
        }
        await Bun.write(pathGroup.replaceBasedir(outDir).path, root.toString());
        toCopy.scan(outDir, pathGroup.replaceBasedir('').path);
      }
    }
  }
  return toCopy;
}
