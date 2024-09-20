// src/dev_server/server-data.ts
var host = '127.0.0.1';
var port = '8000';
var server_ws = `ws://${host}:${port}`;
var server_http = `http://${host}:${port}`;

// src/dev_server/hotreload.bundle.ts
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

//# debugId=D3D9489578FDD31264756E2164756E21
//# sourceMappingURL=hotreload.bundle.js.map
