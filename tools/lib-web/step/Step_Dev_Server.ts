import { Subprocess } from 'bun';
import { Core_Promise_Orphan, Core_Stream_Uint8_Async_ReadLines, Core_Utility_Async_Sleep } from '../../../src/lib/ericchase/api.core.js';
import { NodePlatform_Path_Join, NodePlatform_Shell_StdIn_AddListener } from '../../../src/lib/ericchase/api.platform-node.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';

export let DEVSERVERHOST = '127.0.0.1:8000';

/** An AfterProcessingStep for running the dev server. */
export function Step_Dev_Server(): Builder.Step {
  return new Class();
}
class Class implements Builder.Step {
  StepName = Step_Dev_Server.name;
  channel = Logger(this.StepName).newChannel();

  hotreload_enabled = true;
  process_server?: Subprocess<'ignore', 'pipe', 'pipe'>;

  async onStartUp(): Promise<void> {
    if (Builder.GetMode() !== Builder.MODE.DEV) return;

    this.channel.log('Start Server');
    const p0 = Bun.spawn(['bun', 'run', 'server/tools/start.ts'], { env: { PUBLIC_PATH: NodePlatform_Path_Join('..', Builder.Dir.Out) }, stderr: 'pipe', stdout: 'pipe' });
    const [stdout, stdout_tee] = p0.stdout.tee();
    // wait for server to finish starting up
    // grab host and setup listener to toggle hot reloading
    await Core_Stream_Uint8_Async_ReadLines(stdout_tee, (line) => {
      if (line.startsWith('Serving at')) {
        DEVSERVERHOST = new URL(line.slice('Serving at'.length).trim()).host;
      } else if (line.startsWith('Console at')) {
        NodePlatform_Shell_StdIn_AddListener(async (bytes, text) => {
          if (text === 'h') {
            this.hotreload_enabled = !this.hotreload_enabled;
            if (this.hotreload_enabled === true) {
              this.channel.log("Hot Refresh On    (Press 'h' to toggle.)");
            } else {
              this.channel.log("Hot Refresh Off   (Press 'h' to toggle.)");
            }
          }
        });
        this.channel.log("Hot Refresh On    (Press 'h' to toggle.)");
        return false;
      }
    });
    Core_Promise_Orphan(Core_Stream_Uint8_Async_ReadLines(p0.stderr, (line) => this.channel.error(line)));
    Core_Promise_Orphan(Core_Stream_Uint8_Async_ReadLines(stdout, (line) => this.channel.log(line)));
    this.process_server = p0;
  }
  async onRun(): Promise<void> {
    if (this.process_server !== undefined && this.hotreload_enabled === true) {
      fetch(`http://${DEVSERVERHOST}/server/reload`)
        .then(() => Core_Utility_Async_Sleep(1000))
        .then(() => {
          // a reminder to dev that the server is running
          this.channel.log(`Serving at http://${DEVSERVERHOST}/`);
          this.channel.log(`Console at http://${DEVSERVERHOST}/console`);
        })
        .catch((error) => {
          this.channel.error(error);
        });
    }
  }
  async onCleanUp(): Promise<void> {
    this.process_server?.kill();
    this.process_server = undefined;
  }
}
