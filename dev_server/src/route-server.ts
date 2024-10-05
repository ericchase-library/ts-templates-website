import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { ConsoleLog } from './lib/ericchase/Utility/Console.js';

export namespace server {
  export async function getConsole(): Promise<Response | undefined> {
    return new Response(Bun.file('./console.html'));
  }
  export async function get(pathname: string): Promise<Response | undefined> {
    switch (pathname) {
      case '/server/restart': {
        ConsoleLog('Restarting...');
        setTimeout(() => process.exit(1), 100);
        return new Response('Restarting server.');
      }
      case '/server/shutdown': {
        ConsoleLog('Shutting down...');
        setTimeout(() => process.exit(2), 100);
        return new Response('Shutting down server.');
      }
      case '/server/list': {
        const entries: string[] = [];
        if (Bun.env.PUBLIC_PATH) {
          const public_path = path.normalize(Bun.env.PUBLIC_PATH);
          for (const entry of await readdir(public_path, {
            encoding: 'utf8',
            recursive: true,
            withFileTypes: true,
          })) {
            if (entry.isFile()) {
              entries.push(path.relative(public_path, `${entry.parentPath}\\${entry.name}`));
            }
          }
        }
        return new Response(JSON.stringify(entries.sort()));
      }
    }
  }
}
