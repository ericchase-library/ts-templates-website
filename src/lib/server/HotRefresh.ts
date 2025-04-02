import { SERVER_HOST } from './constants.js';

export function HotRefresh(serverhost?: string): CHotRefresh {
  return new CHotRefresh(serverhost);
}

class CHotRefresh {
  socket?: WebSocket;
  methods = {
    onClose: (event: CloseEvent) => {
      this.cleanup();
    },
    onError: (event: Event) => {
      this.cleanup();
    },
    onMessage: (event: MessageEvent<any>) => {
      if (event.data === 'reload') {
        window.location.reload();
      }
    },
  };
  constructor(readonly serverhost?: string) {
    this.serverhost ??= SERVER_HOST;
    this.startup();
  }
  cleanup() {
    if (this.socket) {
      this.socket.removeEventListener('close', this.methods.onClose);
      this.socket.removeEventListener('error', this.methods.onError);
      this.socket.removeEventListener('message', this.methods.onMessage);
      this.socket = undefined;
    }
  }
  startup() {
    this.socket = new WebSocket(`ws://${this.serverhost}/`);
    if (this.socket) {
      this.socket.addEventListener('close', this.methods.onClose);
      this.socket.addEventListener('error', this.methods.onError);
      this.socket.addEventListener('message', this.methods.onMessage);
    }
  }
}
