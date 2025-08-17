// src/lib/ericchase/Core_Console_Error.ts
function Core_Console_Error(...items) {
  console["error"](...items);
}

// src/lib/ericchase/WebPlatform_Node_Reference_Class.ts
class Class_WebPlatform_Node_Reference_Class {
  node;
  constructor(node) {
    this.node = node;
  }
  as(constructor_ref) {
    if (this.node instanceof constructor_ref) {
      return this.node;
    }
    throw new TypeError(`Reference node ${this.node} is not ${constructor_ref}`);
  }
  is(constructor_ref) {
    return this.node instanceof constructor_ref;
  }
  passAs(constructor_ref, fn) {
    if (this.node instanceof constructor_ref) {
      fn(this.node);
    }
  }
  tryAs(constructor_ref) {
    if (this.node instanceof constructor_ref) {
      return this.node;
    }
  }
  get classList() {
    return this.as(HTMLElement).classList;
  }
  get className() {
    return this.as(HTMLElement).className;
  }
  get style() {
    return this.as(HTMLElement).style;
  }
  getAttribute(qualifiedName) {
    return this.as(HTMLElement).getAttribute(qualifiedName);
  }
  setAttribute(qualifiedName, value) {
    this.as(HTMLElement).setAttribute(qualifiedName, value);
  }
  getStyleProperty(property) {
    return this.as(HTMLElement).style.getPropertyValue(property);
  }
  setStyleProperty(property, value, priority) {
    this.as(HTMLElement).style.setProperty(property, value, priority);
  }
}
function WebPlatform_Node_Reference_Class(node) {
  return new Class_WebPlatform_Node_Reference_Class(node);
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
    return new URL(import.meta.url).host;
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

// src/index.module.ts
EnableHotReload();

class Page {
  divMessages;
  constructor() {
    this.divMessages = WebPlatform_Node_Reference_Class(document.querySelector("#messages")).as(HTMLDivElement);
  }
  addMessage(text) {
    try {
      const div = document.createElement("div");
      const pre = document.createElement("pre");
      pre.textContent = text;
      div.appendChild(pre);
      this.divMessages.prepend(div);
      div.scrollIntoView(false);
      return div;
    } catch (error) {
      Core_Console_Error(error);
    }
  }
}
var page = new Page;
page.addMessage("Hello, Module!");
