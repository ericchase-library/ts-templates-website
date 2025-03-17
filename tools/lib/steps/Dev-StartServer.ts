import { Subprocess } from 'bun';
import { AsyncLineReader } from 'src/lib/ericchase/Algorithm/Stream.js';
import { AddStdinListener } from 'src/lib/ericchase/Platform/StdinReader.js';
import { Debounce } from 'src/lib/ericchase/Utility/Debounce.js';
import { Logger } from 'src/lib/ericchase/Utility/Logger.js';
import { Sleep } from 'src/lib/ericchase/Utility/Sleep.js';
import { server_http } from 'src/lib/server/server.js';
import { BuilderInternal, Step } from 'tools/lib/Builder.js';

const logger = Logger(Step_StartServer.name);

export function Step_StartServer(): Step {
  return new CStep_StartServer();
}

class CStep_StartServer implements Step {
  logger = logger.newChannel();

  child_process?: Subprocess<'ignore', 'pipe', 'pipe'>;
  enabled = false;

  disable() {
    this.enabled = false;
    this.unwatch?.();
    this.unwatch = undefined;
    logger.log("Hot Refresh Off   (Press 'h' to toggle.)");
  }
  enable(builder: BuilderInternal) {
    this.enabled = true;
    const onchange = Debounce(() => this.onchange(), 100);
    this.unwatch = builder.platform.Directory.watch(builder.dir.out, onchange);
    logger.log("Hot Refresh On    (Press 'h' to toggle.)");
  }
  onchange() {
    fetch(`${server_http}/server/reload`).catch((error) => {
      logger.error(error);
    });
  }
  unwatch?: () => void;

  async run(builder: BuilderInternal) {
    this.logger.log('Start Server');
    if (builder.watchmode === true) {
      const p0 = Bun.spawn(['bun', 'run', 'server/tools/start.ts'], { stderr: 'pipe', stdout: 'pipe' });
      (async () => {
        for await (const lines of AsyncLineReader(p0.stdout)) {
          logger.log(...lines);
        }
      })().catch((error) => {
        logger.error(error);
      });
      (async () => {
        for await (const lines of AsyncLineReader(p0.stderr)) {
          logger.error(...lines);
        }
      })().catch((error) => {
        logger.error(error);
      });
      this.child_process = p0;

      // give the server some time to start up
      Sleep(1000)
        .then(() => {
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
        })
        .catch((error) => {
          logger.error(error);
        });
    }
  }
}
