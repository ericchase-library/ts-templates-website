import path from 'node:path';
import { ConsoleLog } from './lib/ericchase/Utility/Console.js';
import { server } from './route-server.js';

export async function get(req: Request, url: URL, pathname: string): Promise<Response | undefined> {
  ConsoleLog(`GET      ${pathname}`);

  // server api
  if (url.pathname === '/console') return server.getConsole();
  if (url.pathname.startsWith('/server')) return server.get(pathname);

  // custom routing here
  switch (pathname) {
    case '/': {
      return getPublicResource('index.html');
    }
  }

  return getPublicResource(pathname);
}

async function getPublicResource(pathname: string): Promise<Response | undefined> {
  if (Bun.env.PUBLIC_PATH) {
    const public_path = path.normalize(Bun.env.PUBLIC_PATH);
    const resource_path = path.join(public_path, path.normalize(pathname));
    if (path.parse(path.relative(public_path, resource_path)).root === '') {
      const resource = Bun.file(resource_path);
      if (await resource.exists()) {
        return new Response(resource);
      }
    }
  }
}
