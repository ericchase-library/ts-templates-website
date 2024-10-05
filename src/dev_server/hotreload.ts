import { server_ws } from './server-data.js';

let socket: WebSocket | undefined = undefined;

function onMessage(event: MessageEvent<any>) {
  if (event.data === 'reload') {
    window.location.reload();
  }
}
function onClose() {
  socket_cleanup();
}
function onError() {
  socket_cleanup();
}

function socket_cleanup() {
  if (socket) {
    socket.removeEventListener('message', onMessage);
    socket.removeEventListener('close', onClose);
    socket.removeEventListener('error', onError);
    socket_restart();
  }
}

export function socket_restart() {
  console.log('socket_restart');
  socket = new WebSocket(server_ws);
  if (socket) {
    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);
  }
}
