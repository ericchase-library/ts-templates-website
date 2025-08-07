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
var SERVER_HOST = "127.0.0.1:8000";

// src/lib/server/HotRefresh.ts
function HotRefresh(serverhost) {
  return new CHotRefresh(serverhost);
}

class CHotRefresh {
  serverhost;
  socket;
  methods = {
    onClose: (event) => {
      this.cleanup();
    },
    onError: (event) => {
      this.cleanup();
    },
    onMessage: (event) => {
      if (event.data === "reload") {
        window.location.reload();
      }
    }
  };
  constructor(serverhost) {
    this.serverhost = serverhost;
    this.serverhost ??= SERVER_HOST;
    this.startup();
  }
  cleanup() {
    if (this.socket) {
      this.socket.removeEventListener("close", this.methods.onClose);
      this.socket.removeEventListener("error", this.methods.onError);
      this.socket.removeEventListener("message", this.methods.onMessage);
      this.socket = undefined;
    }
  }
  startup() {
    this.socket = new WebSocket(`ws://${this.serverhost}/`);
    if (this.socket) {
      this.socket.addEventListener("close", this.methods.onClose);
      this.socket.addEventListener("error", this.methods.onError);
      this.socket.addEventListener("message", this.methods.onMessage);
    }
  }
}

// src/index.module.ts
HotRefresh();

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
