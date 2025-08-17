(() => {
  // src/lib/ericchase/Core_Console_Error.ts
  function Core_Console_Error(...items) {
    console["error"](...items);
  }

  // src/lib/server/constants.ts
  var SERVERHOST = CheckENV() ?? CheckCurrentScript() ?? CheckMetaUrl() ?? CheckError() ?? window.location.host;
  function CheckENV() {
    try {
      return process.env.SERVERHOST;
    } catch {}
  }
  function CheckCurrentScript() {
    try {
      return new URL(document.currentScript.src).host;
    } catch {}
  }
  function CheckMetaUrl() {
    try {
      return new URL(undefined).host;
    } catch {}
  }
  function CheckError() {
    try {
      return new URL(new Error().fileName).host;
    } catch {}
  }

  // src/lib/server/enable-hot-reload.ts
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
      socket = new WebSocket("ws://" + serverhost);
      if (socket !== undefined) {
        socket.onclose = () => cleanup();
        socket.onerror = () => cleanup();
        socket.onmessage = (event) => {
          if (event.data === "reload") {
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
  function EnableHotReload(serverhost) {
    startup(serverhost ?? SERVERHOST);
  }

  // src/lib/server/enable-hot-reload.iife.ts
  EnableHotReload();
})();
