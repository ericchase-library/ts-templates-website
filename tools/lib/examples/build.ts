import { Builder } from '../Builder.js';
import { Processor_BasicWriter } from '../processors/FS-BasicWriter.js';
import { Processor_TypeScript_GenericBundlerImportRemapper } from '../processors/TypeScript-GenericBundler-ImportRemapper.js';
import { Processor_TypeScript_GenericBundler } from '../processors/TypeScript-GenericBundler.js';
import { Step_Bun_Run } from '../steps/Bun-Run.js';
import { Step_CleanDirectory } from '../steps/FS-CleanDirectory.js';
import { Step_Format } from '../steps/FS-Format.js';

// Use command line arguments to set watch mode.
const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

builder.setStartupSteps([
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_CleanDirectory(builder.dir.out),
  Step_Format('quiet'),
  //
]);

// Basic setup for a general typescript project. Typescript files that match
// "*.module.ts" and "*.script.ts" are bundled and written to the out folder.
// The other typescript files do not produce bundles. Module ("*.module.ts")
// files will not bundle other module files. Instead, they'll import whatever
// exports are needed from other module files. Script ("*.script.ts") files, on
// the other hand, produce fully contained bundles. They do not import anything
// from anywhere. Use them accordingly.
builder.setProcessorModules([
  Processor_TypeScript_GenericBundler({ sourcemap: 'none', target: 'browser' }),
  Processor_TypeScript_GenericBundlerImportRemapper(),
  Processor_BasicWriter(['**/*'], ['**/*.ts', `${builder.dir.lib.standard}/**/*`]), // all files except for .ts and lib files
  Processor_BasicWriter(['**/*.module.ts', '**/*.script.ts'], []), // all module and script files
  //
]);

builder.setCleanupSteps([
  Step_Format('quiet'),
  //
]);

await builder.start();
