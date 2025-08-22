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
        socket.onclose = (event) => {
          switch (event.code) {
            case 1006:
              reloadOnServerRestart(serverhost);
              break;
          }
          cleanup();
        };
        socket.onerror = (event) => {};
        socket.onmessage = (event) => {
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
  function reloadOnServerRestart(serverhost, options) {
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
})();
