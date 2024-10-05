// src/dev_server/server-data.ts
var server_hostname = '127.0.0.1';
var server_port = '8000';
var server_http = `http://${server_hostname}:${server_port}`;
var server_ws = `ws://${server_hostname}:${server_port}`;

// src/dev_server/hotreload.module.ts
function onMessage(event) {
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
function socket_restart() {
  socket = new WebSocket(server_ws);
  if (socket) {
    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);
  }
}
var socket = undefined;
socket_restart();

//# debugId=7BC237746F81AFBE64756E2164756E21
//# sourceMappingURL=hotreload.module.js.map
