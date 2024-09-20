import { Broadcast } from '../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { GlobManager } from '../src/lib/ericchase/Platform/Bun/Glob.js';
import { Run } from '../src/lib/ericchase/Platform/Bun/Process.js';
import { CleanDirectory } from '../src/lib/ericchase/Platform/Node/Fs.js';
import { Path } from '../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleLog } from '../src/lib/ericchase/Utility/Console.js';
import { CustomComponentPreprocessor } from './lib/HTMLPreprocessor_CustomComponent.js';
import { ImportConverterPreprocessor } from './lib/HTMLPreprocessor_ImportConverter.js';
import { BuildRunner, copy, processHTML } from './lib/build.js';
import { CacheClear } from './lib/cache.js';

const out_dir = new Path('public');
const src_dir = new Path('src');

const script_extensions = ['.ts', '.tsx'];
const bundle_patterns = ['**/*.bundle.ts', '**/*.module.ts'];
const module_patterns = ['*.module.ts'];
const component_patterns = ['components/**/*.html'];
const dot_component_patterns = ['components/**/.*.html']; // not included in regular scans
const lib_patterns = ['lib/**/*'];

const bun_bundler = new BuildRunner(Log);

export async function buildStep_Clean() {
  bun_bundler.killAll();
  CacheClear();
  await CleanDirectory(out_dir.path);
}

export async function buildStep_Bundle(watch = false) {
  const to_bundle = new GlobManager().scan(src_dir, ...bundle_patterns);
  for (const entry of to_bundle.path_groups) {
    bun_bundler.add({ entry, external_imports: module_patterns, out_dir, sourcemap_mode: 'linked', watch });
  }
  if (watch === false) {
    for (const [_, process] of bun_bundler.subprocess_map) {
      await process.exited;
    }
  }
}

export async function buildStep_ProcessHTMLFiles(watch = false) {
  // converts script tag imports in html files
  const import_converter_preprocessor = new ImportConverterPreprocessor(['.ts', '.js']); // from .ts to .js

  // compiles custom components in html files
  const custom_component_preprocessor = new CustomComponentPreprocessor();

  // dot files (like .env) are usually reserved for special use cases. for one
  // of my projects, i needed both a way to process component html files to
  // extract the necessary elements, and a way to copy the component html files
  // as is, without any processing. i decided that dot files could be copied as
  // is, and non-dot files could be processed. this was an easy way to achieve
  // what i wanted. of course, there are plenty of other ways to do the same
  // thing, but this was a good chance to show off some of the things you can
  // do with custom build tools.

  // add components
  for (const { name, path } of new GlobManager().scan(src_dir, ...component_patterns).path_groups) {
    custom_component_preprocessor.registerComponentPath(name, path);
  }

  // add dot components (notice `scanDot` and `registerComponentPath(,,true)`
  for (const { name, path } of new GlobManager().scanDot(src_dir, ...dot_component_patterns).path_groups) {
    custom_component_preprocessor.registerComponentPath(name.slice(1), path, true);
  }

  const processedHTMLPaths = await processHTML({
    out_dir,
    to_process: new GlobManager().scan(src_dir, '**/*.html'),
    to_exclude: new GlobManager().scan(src_dir, ...component_patterns, ...lib_patterns),
    preprocessors: [import_converter_preprocessor, custom_component_preprocessor],
  });
  for (const path of processedHTMLPaths.paths) {
    Log(`ProcessHTMLFile: ${path}`);
  }

  if (watch === false) {
    for (const [tag, count] of custom_component_preprocessor.component_usage_count) {
      // report component copy counters
      Log(`${count === 1 ? '1 copy' : `${count} copies`} of ${tag}`);
    }
  }
}

export async function buildStep_Copy() {
  const copiedPaths = await copy({
    out_dir,
    to_copy: new GlobManager().scan(src_dir, '**/*'),
    to_exclude: new GlobManager().scan(src_dir, ...script_extensions.map((ext) => `**/*${ext}`), ...bundle_patterns, ...component_patterns, ...lib_patterns),
  });
  for (const path of copiedPaths.paths) {
    Log(`Copy: ${path}`);
  }
}

export async function buildStep_Move() {
  // Move Index
  // github pages is a popular choice for static website hosting. there's just
  // one small issue:
  //
  // https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
  // > The source branch can be any branch in your repository, and the source
  // > folder can either be the root of the repository (/) on the source branch
  // > or a /docs folder on the source branch.
  //
  // the classic github pages system doesn't allow serving directly from a
  // subfolder in a repository. users would need to find a workaround. this
  // issue is especially frustrating when using popular frontend frameworks,
  // because those tools typically build the webpage into a subfolder called
  // "build" or "dist". there's generally no clean solution when using those
  // tools. and the workarounds are not particularly great. since we have a
  // custom build tool, we can easily move the built index file to the root
  // directory and call it a day. the only change we would need to make is
  // adding the buildDir into any links on the index page. for example,
  // `<script src="./index.js" type="module"></script>` would become
  // `<script src="./public/index.js" type="module"></script>`. hopefully i'll
  // be able to automate this process in the future. for now, we won't do this,
  // because the local server reads from the public/ folder
  //
  // if (await CopyFile({ from: PathGroup.new({ basedir: outDir, path: 'index.html' }).path, to: PathGroup.new({ path: 'index.html' }).path })) {
  //   DeleteFile(PathGroup.new({ basedir: outDir, path: 'index.html' }).path);
  // }
}

export const on_log = new Broadcast<void>();
export function Log(data: string) {
  ConsoleLog(`${new Date().toLocaleTimeString()} > ${data}`);
  on_log.send();
}

if (Bun.argv[1] === __filename) {
  await Run('bun update');
  await Run('bun run format silent');
  await buildStep_Clean();
  await buildStep_Bundle();
  await buildStep_ProcessHTMLFiles();
  await buildStep_Copy();
  await Run('bun run format');
  // await Run('bun test');
}
