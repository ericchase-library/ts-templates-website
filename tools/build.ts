import { Broadcast } from '../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { GlobManager } from '../src/lib/ericchase/Platform/Bun/Path.js';
import { Run } from '../src/lib/ericchase/Platform/Bun/Process.js';
import { CleanDirectory } from '../src/lib/ericchase/Platform/Node/Fs.js';
import { NormalizePath } from '../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleLog } from '../src/lib/ericchase/Utility/Console.js';
import { CustomComponentPreprocessor } from './lib/CustomComponentPreprocessor.js';
import { ImportConverterPreprocessor } from './lib/ImportConverterPreprocessor.js';
import { BuildRunner, copy, processHTML } from './lib/build.js';
import { CacheClear } from './lib/cache.js';

export const onLog = new Broadcast<void>();
export function Log(data: string) {
  ConsoleLog(`${new Date().toLocaleTimeString()} > ${data}`);
  onLog.send();
}

// User Values
const outDir = NormalizePath('public');
const srcDir = NormalizePath('src');

const bundlePatterns = ['**/*.bundle.ts', '**/*.module.ts'];
const componentPatterns = ['components/**/*.html'];
const dotComponentPatterns = ['components/**/.*.html']; // not included in regular scans
const libPatterns = ['lib/**/*'];

const buildRunner = new BuildRunner(Log);

export async function buildSteps(watch = false) {
  const toExclude = new GlobManager().scan(srcDir, ...bundlePatterns, ...componentPatterns, ...libPatterns, '**/*.ts');
  // generally, we don't want to copy lib
  // files or component html files

  // Process HTML Files
  const importConverterPreprocessor = new ImportConverterPreprocessor(['.ts', '.js']);
  const customComponentPreprocessor = new CustomComponentPreprocessor();
  /**
   * dot files (like .env) are usually reserved for special use cases. for one of
   * my projects, i needed both a way to process component html files to extract
   * the necessary elements, and a way to copy the component html files as is,
   * without any processing. i decided that dot files could be copied as is, and
   * non-dot files could be processed. this was an easy way to achieve what i
   * wanted. of course, there are plenty of other ways to do the same thing, but
   * this was a good chance to show off some of the things you can do with custom
   * build tools.
   */
  for (const { name, path } of new GlobManager().scan(srcDir, ...componentPatterns).pathGroups) {
    // add components
    customComponentPreprocessor.registerComponentPath(name, path);
  }
  for (const { name, path } of new GlobManager().scanDot(srcDir, ...dotComponentPatterns).pathGroups) {
    // add dot components (notice `scanDot` and `registerComponentPath(,,true)`
    customComponentPreprocessor.registerComponentPath(name.slice(1), path, true);
  }
  const toProcess = new GlobManager().scan(srcDir, '**/*.html');
  const processedHTMLPaths = await processHTML({
    outDir,
    toProcess,
    toExclude,
    preprocessors: [importConverterPreprocessor, customComponentPreprocessor],
  });
  toExclude.update(toProcess);
  for (const path of processedHTMLPaths.paths) {
    Log(path);
  }
  if (watch === false) {
    for (const [tag, count] of customComponentPreprocessor.componentUsageCount) {
      // report component copy counters
      Log(`${count === 1 ? '1 copy' : `${count} copies`} of ${tag}`);
    }
  }

  // Build Typescript Bundles
  const toBundle = new GlobManager().scan(srcDir, ...bundlePatterns);
  for (const entry of toBundle.pathGroups) {
    buildRunner.build({ entry, outDir, watch });
  }
  if (watch === false) {
    for (const [_, process] of buildRunner.subprocessMap) {
      await process.exited;
    }
  }

  // Copy Remaining Files
  const copiedPaths = await copy({
    outDir,
    toCopy: new GlobManager().scan(srcDir, '**/*'),
    toExclude,
  });
  for (const path of copiedPaths.paths) {
    Log(path);
  }

  // Move Index
  /**
   * github pages is a popular choice for static website hosting. there's just
   * one small issue:
   * https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
   * > The source branch can be any branch in your repository, and the source
   * > folder can either be the root of the repository (/) on the source branch
   * > or a /docs folder on the source branch.
   * classic github pages system doesn't allow serving directly from a subfolder
   * in a repository. users would need to find a workaround. this issue is
   * especially frustrating when using popular frontend frameworks, because those
   * tools typically build the webpage into a subfolder called "build" or "dist".
   * there's generally no clean solution when using those tools. and the
   * workarounds are not particularly great. since we have a custom build tool,
   * we can easily move the built index file to the root directory and call it a
   * day. the only change we would need to make is adding the buildDir into any
   * links on the index page. for example,
   * `<script src="./index.js" type="module"></script>` would become
   * `<script src="./public/index.js" type="module"></script>`.
   * hopefully i'll be able to automate this process in the future. for now, we
   * won't do this, because the local server reads from the public/ folder
   */
  // if (await CopyFile({ from: PathGroup.new({ basedir: outDir, path: 'index.html' }).path, to: PathGroup.new({ path: 'index.html' }).path })) {
  //   DeleteFile(PathGroup.new({ basedir: outDir, path: 'index.html' }).path);
  // }
}

export async function buildClear() {
  CacheClear();
  await CleanDirectory(outDir);
}

if (Bun.argv[1] === __filename) {
  await Run('bun update');
  await Run('bun run format silent');
  await buildClear();
  await buildSteps();
  await Run('bun run format');
  // await Run('bun test');
}
