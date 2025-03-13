import { Subprocess } from 'bun';
import { Debounce } from 'src/lib/ericchase/Utility/Debounce.js';
import { Sleep } from 'src/lib/ericchase/Utility/Sleep.js';
import { server_http } from 'src/lib/server/server.js';
import { Builder } from 'tools/lib/Builder.js';
import { BuildStep, BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { Processor_FSBasicWriter } from 'tools/lib/processors/FS-Basic-Writer.js';
import { Processor_HTMLCustomComponent } from 'tools/lib/processors/HTML-Custom-Component.js';
import { Processor_HTMLImportConverter } from 'tools/lib/processors/HTML-Import-Converter.js';
import { Processor_TypeScriptGenericBundlerImportRemapper } from 'tools/lib/processors/TypeScript-Generic-Bundler-Import-Remapper.js';
import { Processor_TypeScriptGenericBundler } from 'tools/lib/processors/TypeScript-Generic-Bundler.js';
import { BuildStep_BunInstall } from 'tools/lib/steps/Bun-Install.js';

const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

builder.setStartupSteps([
  BuildStep_BunInstall('quiet'),
  // Run Dev Server
  new (class StartDevServer implements BuildStep {
    child_process: Subprocess<'ignore', 'inherit', 'inherit'> | undefined;
    onchange = Debounce(() => {
      try {
        fetch(`${server_http}/server/reload`);
      } catch (error) {}
    }, 100);
    async run(builder: BuilderInternal) {
      if (builder.watchmode === true) {
        this.child_process = Bun.spawn(['bun', 'run', 'server/tools/start.ts'], { stderr: 'inherit', stdout: 'inherit' });
        // give the server some time to start up
        Sleep(100).then(() => {
          builder.platform.Directory.watch(builder.dir.out, () => this.onchange());
        });
      }
    }
  })(),
  //
]);

builder.setProcessorModules([
  Processor_HTMLCustomComponent(),
  Processor_HTMLImportConverter(),
  Processor_TypeScriptGenericBundler({ sourcemap: 'none', target: 'bun' }),
  Processor_TypeScriptGenericBundlerImportRemapper(),
  Processor_FSBasicWriter(['**/*'], ['**/*.ts', `${builder.dir.lib.standard}/**/*`]), // all files except for .ts and lib files
  Processor_FSBasicWriter(['**/*.module.ts', '**/*.script.ts'], []), // all module and script files
  //
]);

await builder.start();
