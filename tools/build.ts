import { GlobManager } from '../src/lib/ericchase/Platform/Bun/Path.js';
import { CleanDirectory, DeleteDirectory } from '../src/lib/ericchase/Platform/Node/Fs.js';
import { NormalizePath } from '../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleLog } from '../src/lib/ericchase/Utility/Console.js';
import { bundle, copy, processHTML } from './lib/build.js';
import { CustomComponentPreprocessor } from './lib/CustomComponentPreprocessor.js';

// User Values
const buildDir = NormalizePath('./public') + '/';
const sourceDir = NormalizePath('./src') + '/';
const tempDir = NormalizePath('./temp') + '/';

// Init
await CleanDirectory(buildDir);
await CleanDirectory(tempDir);

const toCopy = new GlobManager() // generally, we want to copy all source files
  .scan(sourceDir, '**/*');

const toExclude = new GlobManager() // generally, we don't want to copy lib
  .scan(sourceDir, 'lib/**/*') //   // files or component html files
  .scan(sourceDir, 'components/**/*.html');

// Process Components
const htmlList = ['**/*.html'];
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
for (const { name, path } of new GlobManager().scanDot(sourceDir, 'components/**/.*.html').pathGroups) {
  customComponentPreprocessor.registerComponentPath(name.slice(1), path, true);
}
for (const { name, path } of new GlobManager().scan(sourceDir, 'components/**/*.html').pathGroups) {
  customComponentPreprocessor.registerComponentPath(name, path);
}
const toProcess = new GlobManager() //
  .scan(sourceDir, ...htmlList);
toCopy.update(
  await processHTML({
    outDir: tempDir,
    toProcess,
    toExclude,
    preprocessors: [customComponentPreprocessor.preprocess],
  }),
);
toExclude.scan(sourceDir, ...htmlList);
for (const [tag, count] of customComponentPreprocessor.componentUsageCount) {
  ConsoleLog(count === 1 ? '1 copy' : count + ' copies', 'of', tag);
}

// Bundle
const tsList = ['**/*.ts'];
const toBundle = new GlobManager() // the individual compiler script is not yet
  .scan(sourceDir, ...tsList); // ready, so we just bundle each typescript file
//                             // that isn't being excluded. they will show up
//                             // in their respective subdirectories under the
//                             // build folder.

// processed files are stored in tempDir, so their paths are added to the toCopy set
toCopy.update(
  await bundle({
    outDir: tempDir,
    toBundle,
    toExclude,
  }),
);
toExclude.scan(sourceDir, ...tsList);

// Exclude
toExclude
  .scan(sourceDir, '**/*.ts') // exclude .ts files now that bundling is done
  .scan(sourceDir, '**/*.template.html'); // exclude processed template files

// Copy
await copy({
  outDir: buildDir,
  toCopy,
  toExclude,
});

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
// if (await CopyFile({ from: buildDir + 'index.html', to: './index.html' })) {
//   DeleteFile(buildDir + 'index.html');
// }

// Cleanup
// if you ever want to inspect tempDir folder, just comment out this line
await DeleteDirectory(tempDir);
