const host = '127.0.0.1';
const port = '8000';

export const server_ws = `ws://${host}:${port}`;
export const server_http = `http://${host}:${port}`;

//                                                                          \\
//
// Hot Reload

export function EnableHotReload() {
  const socket = new WebSocket(server_ws);
  socket.addEventListener('message', (event) => {
    if (event.data === 'reload') {
      window.location.reload();
    }
  });
}
