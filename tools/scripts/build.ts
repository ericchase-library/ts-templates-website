import { Broadcast } from '../../src/lib/ericchase/Design Pattern/Observer/Broadcast.js';
import { RunSync } from '../../src/lib/ericchase/Platform/Bun/Child Process.js';
import { GlobScanner } from '../../src/lib/ericchase/Platform/Bun/Glob.js';
import { CleanDirectory, RenameFile } from '../../src/lib/ericchase/Platform/Node/Fs.js';
import { Path } from '../../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleLog, ConsoleNewline } from '../../src/lib/ericchase/Utility/Console.js';
import { command_map } from '../dev.js';
import { BuildRunner, copy, IntoPatterns, processHTML } from '../lib/build.js';
import { Cache_FileStats_Lock, Cache_FileStats_Reset, Cache_FileStats_Unlock } from '../lib/cache/FileStatsCache.js';
import { Cache_Unlock, TryLock, TryLockEach } from '../lib/cache/LockCache.js';
import { IIFEWrapperPreprocessor } from '../lib/preprocessors/FilePreprocessor_IIFEWrapper.js';
import { CustomComponentPreprocessor } from '../lib/preprocessors/HTMLPreprocessor_CustomComponent.js';
import { ImportConverterPreprocessor } from '../lib/preprocessors/HTMLPreprocessor_ImportConverter.js';

// user config
const source_extensions = ['.ts']; // extensions for source files for building
const module_suffixes = ['.module']; // bundled into modules      ie. `name.module.ts`
const script_suffixes = ['.script']; // bundled into iife scripts ie. `name.script.ts`

// directories
export const out_dir = new Path('public'); // final build will appear here
export const src_dir = new Path('src'); // all website files go here
export const lib_dir = new Path('lib'); // for exclusions

// temp directories
// export const tmp_dir = out_dir.newBase(`${out_dir.base}_temp`); // temp folder for build process

// computed patterns
const source_patterns = IntoPatterns('**/*', source_extensions); // for build
const module_patterns = IntoPatterns('**/*', module_suffixes, source_extensions); // for build
const script_patterns = IntoPatterns('**/*', script_suffixes, source_extensions);
const external_import_patterns = IntoPatterns('*', module_suffixes, '.js'); // for build: external
const lib_patterns = [lib_dir.appendSegment('**/*').standard_path];
const component_patterns = ['components/**/*.html'];
const dot_component_patterns = ['components/**/.*.html']; // not included in regular scans

// preprocessors
const iife_wrapper = new IIFEWrapperPreprocessor(script_suffixes.map((suffix) => `${suffix}.js`));
const custom_component = new CustomComponentPreprocessor();
const import_converter = new ImportConverterPreprocessor(
  ...IntoPatterns([...module_suffixes, ...script_suffixes], source_extensions).map((pattern) => [pattern, '.js'] as const), //
  ...source_extensions.map((ext) => [ext, '.js'] as const),
);
const file_renamer: (readonly [string, string])[] = [
  ...IntoPatterns([...module_suffixes, ...script_suffixes], '.js').map((pattern) => [pattern, '.js'] as const), //
];

// build mode
export const build_mode = {
  silent: false,
  watch: false,
};

// bundler
const bundler = new BuildRunner(onLog);

// step: clean
export async function buildStep_Clean() {
  ConsoleLog('Build Step: Clean');
  bundler.killAll();
  Cache_FileStats_Reset();
  await CleanDirectory(out_dir.path);
  // await CleanDirectory(tmp_dir.path);
}

// step: bundle
export async function buildStep_SetupBundler() {
  ConsoleLog('Build Step: Setup Bundler');
  // modules
  for (const entry of new GlobScanner().scan(src_dir, ...module_patterns).path_groups) {
    bundler.add({
      entry,
      external_imports: [...external_import_patterns],
      out_dir: out_dir,
      sourcemap_mode: 'linked',
      target: 'browser',
      watch: build_mode.watch,
    });
  }
  // scripts
  for (const entry of new GlobScanner().scan(src_dir, ...script_patterns).path_groups) {
    bundler.add({
      entry,
      external_imports: [],
      out_dir: out_dir,
      sourcemap_mode: 'linked',
      target: 'browser',
      watch: build_mode.watch,
    });
  }
  if (build_mode.watch === false) {
    await Promise.allSettled([...bundler.subprocess_map].map(([_, process]) => process.exited));
  }
}

// step: process html
export async function buildStep_ProcessHTMLFiles() {
  // add components
  for (const { name, path } of new GlobScanner().scan(src_dir, ...component_patterns).path_groups) {
    custom_component.registerComponentPath(name, path);
  }
  // add dot components (notice `scanDot` and `registerComponentPath(,,true)`
  for (const { name, path } of new GlobScanner().scanDot(src_dir, ...dot_component_patterns).path_groups) {
    custom_component.registerComponentPath(name.slice(1), path, true);
  }

  const processed_html_paths = await processHTML({
    out_dir,
    to_process: new GlobScanner().scan(src_dir, '**/*.html'),
    to_exclude: new GlobScanner().scan(src_dir, ...component_patterns, ...lib_patterns),
    preprocessors: [custom_component, import_converter],
  });
  for (const path of processed_html_paths.paths) {
    onLog(`Preprocessed: ${path}`);
  }

  if (build_mode.watch === false) {
    for (const [tag, count] of custom_component.component_usage_count) {
      // report component copy counters
      onLog(`${count === 1 ? '1 copy' : `${count} copies`} of ${tag}`);
    }
  }
}

// step: copy
export async function buildStep_Copy() {
  ConsoleLog('Build Step: Copy');
  const copied_pathset = await copy({
    out_dirs: [out_dir],
    to_copy: new GlobScanner().scan(src_dir, '**/*'),
    to_exclude: new GlobScanner().scan(src_dir, '**/*.html', ...component_patterns, ...lib_patterns, ...module_patterns, ...script_patterns, ...source_patterns),
  });
  // const tmp_copied_pathset = await copy({
  //   out_dirs: [out_dir],
  //   to_copy: new GlobScanner().scan(tmp_dir, '**/*'), // exclude nothing
  //   preprocessors: [iife_wrapper],
  // });
  const copied_paths = new Set([
    ...copied_pathset.paths, //
    // ...tmp_copied_pathset.paths,
  ]);
  for (const path of copied_paths) {
    onLog(`Copied: ${path}`);
  }
  if (build_mode.watch === false) {
    onLog(`${copied_paths.size} files copied.`);
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

// step: rename
export async function buildStep_Rename() {
  ConsoleLog('Build Step: Rename');
  for (const [from, to] of file_renamer) {
    for (const path of new GlobScanner().scan(out_dir, `**/*${from}`).paths) {
      await RenameFile(path, path.slice(0, path.lastIndexOf(from)) + to);
      onLog(`Renamed: ${path}`);
    }
  }
}

// logger
export const on_log = new Broadcast<void>();
export function onLog(data: string) {
  if (build_mode.silent === false) {
    ConsoleLog(`[${new Date().toLocaleTimeString()}] > ${data}`);
    on_log.send();
  }
}

// direct run
if (Bun.argv[1] === __filename) {
  TryLockEach([command_map.build, command_map.format]);

  RunSync.Bun('update');
  Cache_Unlock(command_map.format);
  RunSync.BunRun('format', 'silent');
  TryLock(command_map.format);

  if (Cache_FileStats_Lock()) {
    ConsoleNewline();
    await buildStep_Clean();
    ConsoleNewline();
    await buildStep_SetupBundler();
    ConsoleNewline();
    await buildStep_ProcessHTMLFiles();
    ConsoleNewline();
    await buildStep_Copy();
    ConsoleNewline();
    await buildStep_Rename();
    ConsoleNewline();
  }
  Cache_FileStats_Unlock();

  Cache_Unlock(command_map.format);
  RunSync.BunRun('format');
}
