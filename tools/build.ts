import { GlobManager } from '../src/lib/ericchase/Platform/Bun/Path.js';
import { ClearDirectory, DeleteDirectory } from '../src/lib/ericchase/Platform/Node/Fs.js';
import { NormalizePath } from '../src/lib/ericchase/Platform/Node/Path.js';
import { LoadIncludeFile, ProcessTemplateFile } from '../src/lib/ericchase/Platform/Web/HTML/TemplateProcessor.js';
import { bundle, copy } from './lib/build.js';

// User Values
const buildDir = NormalizePath('./build') + '/';
const sourceDir = NormalizePath('./src') + '/';
const tempDir = NormalizePath('./temp') + '/';

// Init
await ClearDirectory(buildDir);
await ClearDirectory(tempDir);

const toCopy = new GlobManager() //
  .scan(sourceDir, '**/*'); //          // generally, we want to copy all source files
const toExclude = new GlobManager() //
  .scan(sourceDir, 'lib/**/*'); //      // generally, we don't want to copy lib files
const toBundle = new GlobManager() //
  .scan(sourceDir, '**/*.ts'); //       // for now, the individual compiler script is not yet ready, so we just
//                                      // bundle each typescript file that isn't being excluded. they will show
//                                      // up in their respective subdirectories under the build folder.

// Process Include Components
// you can modify this module however you want, this is just an example
await LoadIncludeFile('hello-bun', sourceDir + 'component/hello-bun.html');
await ProcessTemplateFile(sourceDir + 'index.template.html', buildDir + 'index.html');
toExclude.scan(sourceDir, 'component/*');

// Bundle
// processed files are stored in tempDir, so their paths are added to the toCopy set
toCopy.update(
  await bundle({
    outDir: tempDir,
    toBundle,
    toExclude,
  }),
);

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

// Cleanup
// if you ever to inspect the intermediate files, just comment out this line
await DeleteDirectory(tempDir);
