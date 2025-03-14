import { Subprocess } from 'bun';
import { AddStdinListener } from 'src/lib/ericchase/Platform/StdinReader.js';
import { ConsoleLog } from 'src/lib/ericchase/Utility/Console.js';
import { Debounce } from 'src/lib/ericchase/Utility/Debounce.js';
import { Sleep } from 'src/lib/ericchase/Utility/Sleep.js';
import { server_http } from 'src/lib/server/server.js';
import { BuildStep, BuilderInternal } from 'tools/lib/BuilderInternal.js';

export function Step_StartDevServer(): BuildStep {
  return new CStep_StartDevServer();
}

class CStep_StartDevServer implements BuildStep {
  child_process?: Subprocess<'ignore', 'inherit', 'inherit'>;
  enabled = false;

  disable() {
    this.enabled = false;
    this.unwatch?.();
    this.unwatch = undefined;
    ConsoleLog("Hot Refresh Off   (Press 'h' to toggle.)");
  }
  enable(builder: BuilderInternal) {
    this.enabled = true;
    this.unwatch = builder.platform.Directory.watch(builder.dir.out, () => this.onchange());
    ConsoleLog("Hot Refresh On    (Press 'h' to toggle.)");
  }
  onchange = Debounce(() => {
    try {
      fetch(`${server_http}/server/reload`);
    } catch (error) {}
  }, 100);
  setup(builder: BuilderInternal) {
    this.enable(builder);
    AddStdinListener(async (bytes, text) => {
      if (text === 'h') {
        if (this.enabled === true) {
          this.disable();
        } else {
          this.enable(builder);
        }
      }
    });
  }
  unwatch?: () => void;

  async run(builder: BuilderInternal) {
    if (builder.watchmode === true) {
      this.child_process = Bun.spawn(['bun', 'run', 'server/tools/start.ts'], { stderr: 'inherit', stdout: 'inherit' });
      // give the server some time to start up
      Sleep(500).then(() => {
        this.setup(builder);
      });
    }
  }
}
