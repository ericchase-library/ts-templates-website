(() => {
  // src/lib/ericchase/Core_Console_Error.ts
  function Core_Console_Error(...items) {
    console['error'](...items);
  }

  // src/lib/server/info.ts
  function SERVERHOST() {
    const CheckENV = () => {
      try {
        return process.env.SERVERHOST;
      } catch {}
    };
    const CheckCurrentScript = () => {
      try {
        return new URL(document.currentScript.src).host;
      } catch {}
    };
    const CheckMetaUrl = () => {
      try {
        return new URL(undefined).host;
      } catch {}
    };
    const CheckError = () => {
      try {
        return new URL(new Error().fileName).host;
      } catch {}
    };
    return CheckENV() ?? CheckCurrentScript() ?? CheckMetaUrl() ?? CheckError() ?? window.location.host;
  }

  // src/lib/server/hot-reload.iife.ts
  var socket = undefined;
  function cleanup() {
    if (socket) {
      socket.onclose = () => {};
      socket.onerror = () => {};
      socket.onmessage = () => {};
      socket = undefined;
    }
  }
  function startup(serverhost) {
    try {
      socket = new WebSocket('ws://' + serverhost);
      if (socket !== undefined) {
        socket.onclose = () => cleanup();
        socket.onerror = () => cleanup();
        socket.onmessage = (event) => {
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
  async function async_reloadOnServerRestart(serverhost) {
    try {
      await fetch(serverhost);
      window.location.reload();
    } catch {
      setTimeout(() => async_reloadOnServerRestart(serverhost), 100);
    }
  }
  startup(SERVERHOST());
})();
