import { server_ws } from './server.js';

let socket: WebSocket | undefined = undefined;

function onMessage(event: MessageEvent<any>) {
  if (event.data === 'reload') {
    window.location.reload();
  }
}
function onClose() {
  cleanup();
}
function onError() {
  cleanup();
}

function cleanup() {
  if (socket) {
    socket.removeEventListener('message', onMessage);
    socket.removeEventListener('close', onClose);
    socket.removeEventListener('error', onError);
    EnableHotRefresh();
  }
}

export function EnableHotRefresh() {
  socket = new WebSocket(server_ws);
  if (socket) {
    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);
  }
}
