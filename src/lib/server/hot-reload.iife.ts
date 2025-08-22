/**
 * To use this, add a classic script tag to any HTML file that should be
 * hot-reloaded. The tag should look like this:
 *
 * <script src=".../lib/server/hot-reload.iife.ts"></script>
 *
 * Replace the `...` with a proper relative path.
 */
import { Core_Console_Error } from '../ericchase/Core_Console_Error.js';
import { SERVERHOST } from './info.js';
let socket: WebSocket | undefined = undefined;
function cleanup() {
  if (socket) {
    socket.onclose = () => {};
    socket.onerror = () => {};
    socket.onmessage = () => {};
    socket = undefined;
  }
}
function startup(serverhost: string) {
  try {
    socket = new WebSocket('ws://' + serverhost);
    if (socket !== undefined) {
      socket.onclose = (event) => {
        switch (event.code) {
          case 1006:
            // likely an interrupted connection
            reloadOnServerRestart(serverhost);
            break;
        }
        cleanup();
      };
      socket.onerror = (event) => {};
      socket.onmessage = (event: MessageEvent<string>) => {
        if (event.data === 'reload') {
          reloadOnServerRestart(serverhost);
        }
      };
      socket.onopen = (event) => {};
    }
  } catch (error) {
    Core_Console_Error(error);
  }
}
/**
 * Gives you time (10 seconds by default) to restart the server before giving
 * up. Tweak `options.delay` and `options.retry_count` for your needs.
 */
function reloadOnServerRestart(serverhost: string, options?: { delay?: number; retry_count?: number }) {
  const delay = options?.delay ?? 500;
  const retry_count = options?.retry_count ?? 20;

  socket?.close();
  let count = 0;
  const reload = async () => {
    try {
      count++;
      await fetch(serverhost);
      window.location.reload();
    } catch {
      if (count < retry_count) {
        setTimeout(reload, delay);
      }
    }
  };
  setTimeout(reload, delay);
}
startup(SERVERHOST());
