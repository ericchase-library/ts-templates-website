import { Builder } from 'tools/lib/Builder.js';
import { Processor_BasicWriter } from 'tools/lib/processors/FS-BasicWriter.js';
import { Processor_HTML_CustomComponent } from 'tools/lib/processors/HTML-CustomComponent.js';
import { Processor_HTML_ImportConverter } from 'tools/lib/processors/HTML-ImportConverter.js';
import { Processor_TypeScript_GenericBundlerImportRemapper } from 'tools/lib/processors/TypeScript-GenericBundler-ImportRemapper.js';
import { Processor_TypeScript_GenericBundler } from 'tools/lib/processors/TypeScript-GenericBundler.js';
import { Step_Bun_Run } from 'tools/lib/steps/Bun-Run.js';
import { Step_StartServer } from 'tools/lib/steps/Dev-StartServer.js';
import { Step_CleanDirectory } from 'tools/lib/steps/FS-CleanDirectory.js';
import { Step_Format } from 'tools/lib/steps/FS-Format.js';

const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

builder.setStartupSteps([
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_CleanDirectory(builder.dir.out),
  Step_Format('quiet'),
  Step_StartServer(),
  //
]);

builder.setProcessorModules([
  Processor_HTML_CustomComponent(),
  Processor_HTML_ImportConverter(),
  Processor_TypeScript_GenericBundler({ sourcemap: 'none', target: 'bun' }),
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
