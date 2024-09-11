import { ConsoleLog } from './lib/Console.js';

export async function options(req: Request): Promise<void | Response> {
  const url = new URL(req.url);
  const pathname = decodeURIComponent(url.pathname);
  ConsoleLog(`OPTIONS  ${pathname}`);

  // custom routing here
  switch (pathname) {
    case '/database':
      // Example case of dealing with a public database?
      // For this example, the client might request content-type of JSON,
      //  so the "content-type" header should be allowed.
      return new Response(undefined, {
        headers: {
          // "Access-Control-Allow-Credentials": "true",
          'Access-Control-Allow-Headers': 'content-type',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Origin': '*',
          // "Access-Control-Expose-Headers": "* or [<header-name>[, <header-name>]*]",
          // "Access-Control-Max-Age": "<delta-seconds>",
          // "Vary": "* or <header-name>, <header-name>, ..."
        },
        status: 204, // 204 No Content
      });
  }
}
