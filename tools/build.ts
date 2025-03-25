import { Builder } from './lib/Builder.js';
import { Processor_BasicWriter } from './lib/processors/FS-BasicWriter.js';
import { Processor_HTML_CustomComponent } from './lib/processors/HTML-CustomComponent.js';
import { Processor_HTML_ImportConverter } from './lib/processors/HTML-ImportConverter.js';
import { Processor_TypeScript_GenericBundlerImportRemapper } from './lib/processors/TypeScript-GenericBundler-ImportRemapper.js';
import { Processor_TypeScript_GenericBundler } from './lib/processors/TypeScript-GenericBundler.js';
import { Step_Bun_Run } from './lib/steps/Bun-Run.js';
import { Step_StartServer } from './lib/steps/Dev-StartServer.js';
import { Step_CleanDirectory } from './lib/steps/FS-CleanDirectory.js';
import { Step_Format } from './lib/steps/FS-Format.js';

// Use command line arguments to set watch mode.
const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

// These steps are run during the startup phase only.
builder.setStartupSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_CleanDirectory(builder.dir.out),
  Step_Format('quiet'),
  //
);

// These steps are run before each processing phase.
builder.setBeforeProcessingSteps();

// Basic setup for a typescript powered website. Typescript files that match
// "*.module.ts" and "*.script.ts" are bundled and written to the out folder.
// The other typescript files do not produce bundles. Module ("*.module.ts")
// files will not bundle other module files. Instead, they'll import whatever
// exports are needed from other module files. Script ("*.script.ts") files, on
// the other hand, produce fully contained bundles. They do not import anything
// from anywhere. Use them accordingly.

// HTML custom components are a lightweight alternative to web components made
// possible by the processors below. There are examples
builder.setProcessorModules(
  Processor_HTML_CustomComponent(),
  Processor_HTML_ImportConverter(),
  Processor_TypeScript_GenericBundler({ sourcemap: 'none', target: 'browser' }),
  Processor_TypeScript_GenericBundlerImportRemapper(),
  // all files except for .ts and lib files
  Processor_BasicWriter(['**/*'], ['**/*{.ts,.tsx,.jsx}', `${builder.dir.lib.standard}/**/*`]),
  // all module and script files
  Processor_BasicWriter(['**/*{.module,.script}{.ts,.tsx,.jsx}'], []),
  //
);

// These steps are run after each processing phase.
builder.setAfterProcessingSteps(
  // During "dev" mode (when "--watch" is passed as an argument), the server
  // will start running with hot refreshing if enabled in your index file.
  Step_StartServer(),
  //
);

// These steps are run during the shutdown phase only.
builder.setCleanupSteps();

await builder.start();
