import { Subprocess } from 'bun';
import { AsyncLineReader } from 'src/lib/ericchase/Algorithm/Stream.js';
import { AddStdInListener } from 'src/lib/ericchase/Platform/StdinReader.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { server_http } from 'src/lib/server/server.js';
import { BuilderInternal, Step } from 'tools/lib/Builder.js';

const logger = Logger(Step_StartServer.name);

export function Step_StartServer(): Step {
  return new CStep_StartServer();
}

class CStep_StartServer implements Step {
  channel = logger.newChannel();

  child_process?: Subprocess<'ignore', 'pipe', 'pipe'>;
  hotreload_enabled = true;

  async end(builder: BuilderInternal) {
    if (this.child_process !== undefined) {
      this.child_process.kill();
      this.child_process = undefined;
      this.channel.log('Server Killed');
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
      this.child_process = p0;

      (async () => {
        for await (const lines of AsyncLineReader(p0.stderr)) {
          this.channel.error(...lines);
        }
      })().catch((error) => {
        this.channel.error(error);
      });

      const [stdout, stdout_tee] = p0.stdout.tee();
      (async () => {
        for await (const lines of AsyncLineReader(stdout)) {
          this.channel.log(...lines);
        }
      })().catch((error) => {
        this.channel.error(error);
      });

      (async () => {
        for await (const lines of AsyncLineReader(stdout_tee)) {
          // wait for server to finish starting up before setting up hotkeys
          if (lines.findIndex((line) => line.startsWith('Console at')) !== -1) {
            // setup listener to toggle hot reloading
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
            break;
          }
        }
      })().catch((error) => {
        this.channel.error(error);
      });
    } else if (this.hotreload_enabled === true) {
      // trigger hot reload
      fetch(`${server_http}/server/reload`).catch((error) => {
        this.channel.error(error);
      });
    }
  }
}
