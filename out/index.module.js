// src/lib/ericchase/Utility/UpdateMarker.ts
class UpdateMarker {
  $manager;
  updated = false;
  constructor($manager) {
    this.$manager = $manager;
  }
  reset() {
    this.$manager.resetMarker(this);
  }
}

class UpdateMarkerManager {
  $marks = new Set;
  getNewMarker() {
    const marker = new UpdateMarker(this);
    this.$marks.add(marker);
    return marker;
  }
  resetMarker(mark) {
    mark.updated = false;
    this.$marks.add(mark);
  }
  updateMarkers() {
    for (const mark of this.$marks) {
      this.$marks.delete(mark);
      mark.updated = true;
    }
  }
}

class DataSetMarker {
  $manager;
  dataset = new Set;
  constructor($manager) {
    this.$manager = $manager;
  }
  reset() {
    this.$manager.resetMarker(this);
  }
}

class DataSetMarkerManager {
  $marks = new Set;
  getNewMarker() {
    const marker = new DataSetMarker(this);
    this.$marks.add(marker);
    return marker;
  }
  resetMarker(mark) {
    mark.dataset.clear();
    this.$marks.add(mark);
  }
  updateMarkers(data) {
    for (const mark of this.$marks) {
      mark.dataset.add(data);
    }
  }
}

// src/lib/ericchase/Utility/Console.ts
var marker_manager = new UpdateMarkerManager;
var newline_count = 0;
function ConsoleError(...items) {
  console["error"](...items);
  newline_count = 0;
  marker_manager.updateMarkers();
}

// src/lib/ericchase/Web API/Node_Utility.ts
class CNodeRef {
  node;
  constructor(node) {
    if (node === null) {
      throw new ReferenceError("Reference is null.");
    }
    if (node === undefined) {
      throw new ReferenceError("Reference is undefined.");
    }
    this.node = node;
  }
  as(constructor_ref) {
    if (this.node instanceof constructor_ref)
      return this.node;
    throw new TypeError(`Reference node is not ${constructor_ref}`);
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
function NodeRef(node) {
  return new CNodeRef(node);
}

// src/lib/server/server.ts
var server_http = `http://${window.location.host}/`;
var server_ws = `ws://${window.location.host}/`;

// src/lib/server/HotRefresh.ts
var socket = undefined;
function onMessage(event) {
  if (event.data === "reload") {
    window.location.reload();
  }
}
function onClose() {
  cleanup();
}
function onError() {
  cleanup();
}
function cleanup() {
  if (socket) {
    socket.removeEventListener("message", onMessage);
    socket.removeEventListener("close", onClose);
    socket.removeEventListener("error", onError);
    EnableHotRefresh();
  }
}
function EnableHotRefresh() {
  socket = new WebSocket(server_ws);
  if (socket) {
    socket.addEventListener("message", onMessage);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);
  }
}

// src/index.module.ts
EnableHotRefresh();

class Page {
  divMessages;
  constructor() {
    this.divMessages = NodeRef(document.querySelector("#messages")).as(HTMLDivElement);
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
      ConsoleError(error);
    }
  }
}
var page = new Page;
page.addMessage("Hello, Script!");
