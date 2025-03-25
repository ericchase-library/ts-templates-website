import { Subprocess } from 'bun';
import { U8StreamReadLines } from '../../../src/lib/ericchase/Algorithm/Stream.js';
import { AddStdInListener } from '../../../src/lib/ericchase/Platform/StdinReader.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { Orphan } from '../../../src/lib/ericchase/Utility/Promise.js';
import { BuilderInternal, Step } from '../Builder.js';

const logger = Logger(Step_StartServer.name);

export function Step_StartServer(): Step {
  return new CStep_StartServer();
}

class CStep_StartServer implements Step {
  channel = logger.newChannel();

  child_process?: Subprocess<'ignore', 'pipe', 'pipe'>;
  hotreload_enabled = true;
  server_href?: string;

  async end(builder: BuilderInternal) {
    if (this.child_process !== undefined) {
      this.child_process.kill();
      this.child_process = undefined;
    }
  }
  async run(builder: BuilderInternal) {
    // only start server if in watch mode
    if (builder.watchmode !== true) {
      return;
    }
    if (this.child_process === undefined) {
      // start the server
      this.channel.log('Start Server');
      const p0 = Bun.spawn(['bun', 'run', 'server/tools/start.ts'], { stderr: 'pipe', stdout: 'pipe' });
      const [stdout, stdout_tee] = p0.stdout.tee();
      Orphan(U8StreamReadLines(p0.stderr, (line) => this.channel.error(line)));
      Orphan(U8StreamReadLines(stdout, (line) => this.channel.log(line)));
      this.child_process = p0;
      Orphan(
        // wait for server to finish starting up
        // grab host and setup listener to toggle hot reloading
        U8StreamReadLines(stdout_tee, (line) => {
          if (line.startsWith('Serving at')) {
            this.server_href = line.slice('Serving at'.length).trim();
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
        }),
      );
    } else if (this.hotreload_enabled === true) {
      // trigger hot reload
      if (this.server_href !== undefined) {
        fetch(`${this.server_href}server/reload`).catch((error) => {
          this.channel.error(error);
        });
      }
    }
  }
}
