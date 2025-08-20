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
      socket.onclose = () => cleanup();
      socket.onerror = () => cleanup();
      socket.onmessage = (event: MessageEvent<string>) => {
        if (event.data === 'reload') {
          socket?.close();
          setTimeout(() => async_reloadOnServerRestart(serverhost), 100);
        }
      };
    }
  } catch (error) {
    Core_Console_Error(error);
  }
}
async function async_reloadOnServerRestart(serverhost: string) {
  try {
    await fetch(serverhost);
    window.location.reload();
  } catch {
    setTimeout(() => async_reloadOnServerRestart(serverhost), 100);
  }
}
startup(SERVERHOST());
