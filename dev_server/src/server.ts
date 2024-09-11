import chalk from 'chalk';
import { ConsoleLog } from './lib/Console.js';
import { get } from './router.get.js';
import { options } from './router.options.js';
import { post } from './router.post.js';

const PUBLIC_PATH = '../public';

const PREFERRED_HOSTNAME = Bun.env.HOSTNAME ?? '127.0.0.1';
const PREFERRED_PORT = Number.parseInt(Bun.env.PORT ?? '8000');

Bun.env.HOSTNAME = PREFERRED_HOSTNAME;
Bun.env.PORT = `${PREFERRED_PORT}`;
Bun.env.PUBLIC_PATH = PUBLIC_PATH;

tryStartServer(PREFERRED_HOSTNAME, PREFERRED_PORT);

function createServer(hostname: string, port: number) {
  const server = Bun.serve({
    async fetch(req) {
      try {
        const handler = getMethodHandler(req);
        if (handler) {
          const response = await handler(req);
          if (response) {
            return response;
          }
        }
      } catch (error) {
        ConsoleLog();
        ConsoleLog(error);
        ConsoleLog();
      }
      return new Response('404', { status: 404 });
    },
    hostname: hostname,
    port,
  });
  return server;
}

function getMethodHandler(req: Request): void | ((req: Request) => Promise<void | Response>) {
  return {
    GET: get,
    OPTIONS: options,
    POST: post,
  }[req.method.toUpperCase()];
}

function tryStartServer(hostname: string, port: number) {
  try {
    const server = createServer(hostname, port);
    ConsoleLog('Serving at', `http://${server.hostname === '0.0.0.0' ? 'localhost' : server.hostname}:${server.port}/`);
    ConsoleLog();
  } catch (error) {
    let error_code: 'EADDRINUSE' | 'EBADHOST' | undefined = undefined;

    if (error !== null && typeof error === 'object') {
      if ('code' in error && error.code === 'EADDRINUSE') error_code = 'EADDRINUSE';
      if ('message' in error && error.message === 'Failed to start server. Is port 8000 in use?') error_code = 'EADDRINUSE';
    }

    if (error_code === 'EADDRINUSE') {
      if (testLocalhostServer(port)) {
        error_code = 'EBADHOST';
      } else {
        ConsoleLog(`${chalk.red(error_code)}${chalk.gray(`: Failed to start server. Is port 8000 in use?`)}`);
        ConsoleLog(`Trying port ${port + 1} next.`);
        setTimeout(() => tryStartServer(hostname, port + 1), 0);
        return;
      }
    }

    if (error_code === 'EBADHOST') {
      ConsoleLog(`${chalk.red(error_code)}${chalk.gray(`: Hostname ${hostname} may be invalid.`)}`);
      ConsoleLog(`Please try another hostname or use localhost (127.0.0.1) to serve locally.`);
      return;
    }

    ConsoleLog(error);
  }
}

function testLocalhostServer(port: number) {
  try {
    const server = Bun.serve({
      fetch() {
        return new Response('This is a local test!');
      },
      port,
    });
    server.stop();
    return true;
  } catch (error) {
    return false;
  }
}