import { Subprocess } from 'bun';
import { U8StreamReadLines } from '../../../src/lib/ericchase/Algorithm/Stream.js';
import { Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { AddStdInListener } from '../../../src/lib/ericchase/Platform/StdinReader.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { Orphan } from '../../../src/lib/ericchase/Utility/Promise.js';
import { Sleep } from '../../../src/lib/ericchase/Utility/Sleep.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_DevServer.name);

export let DEVSERVERHOST = '127.0.0.1:8000';

/** An AfterProcessingStep for running the dev server. */
export function Step_DevServer(): Step {
  return new CStep_DevServer();
}

class CStep_DevServer implements Step {
  channel = logger.newChannel();

  hotreload_enabled = true;
  process_server?: Subprocess<'ignore', 'pipe', 'pipe'>;

  async onStartUp(builder: BuilderInternal): Promise<void> {
    // only start server if in watch mode
    if (builder.watchmode !== true) return;

    this.channel.log('Start Server');
    const p0 = Bun.spawn(['bun', 'run', 'server/tools/start.ts'], { env: { PUBLIC_PATH: Path('..', builder.dir.out).raw }, stderr: 'pipe', stdout: 'pipe' });
    const [stdout, stdout_tee] = p0.stdout.tee();
    // wait for server to finish starting up
    // grab host and setup listener to toggle hot reloading
    await U8StreamReadLines(stdout_tee, (line) => {
      if (line.startsWith('Serving at')) {
        DEVSERVERHOST = new URL(line.slice('Serving at'.length).trim()).host;
      } else if (line.startsWith('Console at')) {
        AddStdInListener(async (bytes, text) => {
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
    Orphan(U8StreamReadLines(p0.stderr, (line) => this.channel.error(line)));
    Orphan(U8StreamReadLines(stdout, (line) => this.channel.log(line)));
    this.process_server = p0;
  }
  async onRun(builder: BuilderInternal): Promise<void> {
    if (this.process_server !== undefined && this.hotreload_enabled === true) {
      fetch(`http://${DEVSERVERHOST}/server/reload`)
        .then(() => Sleep(1000))
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
  async onCleanUp(builder: BuilderInternal): Promise<void> {
    this.process_server?.kill();
    this.process_server = undefined;
  }
}
