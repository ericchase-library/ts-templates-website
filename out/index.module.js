// src/lib/ericchase/core.ts
var ARRAY__UINT8__BYTE_TO_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var ARRAY__UINT8__B64_TO_BYTE = new Map([...ARRAY__UINT8__BYTE_TO_B64].map((char, byte) => [char, byte]));
var ARRAY__UINT8__EMPTY = Uint8Array.from([]);
var MATH__FACTORIAL__CACHE = [BigInt(1), BigInt(1)];
var UTILITY__CRC32__TABLE = new Uint32Array(256);
var UTILITY__CRC32__MAGIC = new Uint32Array([3988292384]);
for (let i = 0;i < 256; i++) {
  UTILITY__CRC32__TABLE[i] = i;
  for (let k = 0;k < 8; k++) {
    if (UTILITY__CRC32__TABLE[i] >>> 0 & 1) {
      UTILITY__CRC32__TABLE[i] = UTILITY__CRC32__MAGIC[0] ^ UTILITY__CRC32__TABLE[i] >>> 1;
    } else {
      UTILITY__CRC32__TABLE[i] >>>= 1;
    }
  }
}

class ClassArrayUint8Group {
  arrays = new Array;
  byteLength = 0;
  add(bytes) {
    this.arrays.push(bytes);
    this.byteLength += bytes.byteLength;
    return this.byteLength;
  }
  get(count, offset = 0) {
    const out = new Uint8Array(count);
    let i_out = 0;
    if (offset === 0) {
      for (const bytes of this.arrays) {
        for (let i_bytes = 0;i_bytes < bytes.byteLength; i_bytes++) {
          out[i_out] = bytes[i_bytes];
          i_out++;
          if (i_out >= count) {
            return out;
          }
        }
      }
    } else {
      let i_total = 0;
      for (const bytes of this.arrays) {
        for (let i_bytes = 0;i_bytes < bytes.byteLength; i_bytes++) {
          i_total++;
          if (i_total >= offset) {
            out[i_out] = bytes[i_bytes];
            i_out++;
            if (i_out >= count) {
              return out;
            }
          }
        }
      }
    }
    return out;
  }
}
class ClassUtilityCRC32 {
  $state = new Uint32Array([4294967295]);
  update(bytes) {
    for (let index = 0;index < bytes.length; index++) {
      this.$state[0] = UTILITY__CRC32__TABLE[(this.$state[0] ^ bytes[index]) & 255] ^ this.$state[0] >>> 8;
    }
  }
  get value() {
    return (this.$state[0] ^ 4294967295 >>> 0) >>> 0;
  }
}

// src/lib/ericchase/api.core.ts
function Core_Console_Error(...items) {
  console["error"](...items);
}

// src/lib/ericchase/platform-web.ts
class ClassDomAttributeObserver {
  constructor({
    source = document.documentElement,
    options = { attributeOldValue: true, subtree: true }
  }) {
    this.mutationObserver = new MutationObserver((mutationRecords) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(source, {
      attributes: true,
      attributeFilter: options.attributeFilter,
      attributeOldValue: options.attributeOldValue ?? true,
      subtree: options.subtree ?? true
    });
  }
  subscribe(callback) {
    this.subscriptionSet.add(callback);
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  mutationObserver;
  subscriptionSet = new Set;
  send(record) {
    for (const callback of this.subscriptionSet) {
      callback(record, () => {
        this.subscriptionSet.delete(callback);
      });
    }
  }
}

class ClassDomCharacterDataObserver {
  constructor({ source = document.documentElement, options = { characterDataOldValue: true, subtree: true } }) {
    this.mutationObserver = new MutationObserver((mutationRecords) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(source, {
      characterData: true,
      characterDataOldValue: options.characterDataOldValue ?? true,
      subtree: options.subtree ?? true
    });
  }
  subscribe(callback) {
    this.subscriptionSet.add(callback);
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  mutationObserver;
  subscriptionSet = new Set;
  send(record) {
    for (const callback of this.subscriptionSet) {
      callback(record, () => {
        this.subscriptionSet.delete(callback);
      });
    }
  }
}

class ClassDomChildListObserver {
  constructor({ source = document.documentElement, options = { subtree: true } }) {
    this.mutationObserver = new MutationObserver((mutationRecords) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(source, {
      childList: true,
      subtree: options.subtree ?? true
    });
  }
  subscribe(callback) {
    this.subscriptionSet.add(callback);
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  mutationObserver;
  subscriptionSet = new Set;
  send(record) {
    for (const callback of this.subscriptionSet) {
      callback(record, () => {
        this.subscriptionSet.delete(callback);
      });
    }
  }
}

class ClassDomElementAddedObserver {
  constructor({ source = document.documentElement, options = { subtree: true }, selector, includeExistingElements = true }) {
    this.mutationObserver = new MutationObserver((mutationRecords) => {
      for (const record of mutationRecords) {
        if (record.target instanceof Element && record.target.matches(selector)) {
          this.send(record.target);
        }
        const treeWalker = document.createTreeWalker(record.target, NodeFilter.SHOW_ELEMENT);
        while (treeWalker.nextNode()) {
          if (treeWalker.currentNode.matches(selector)) {
            this.send(treeWalker.currentNode);
          }
        }
      }
    });
    this.mutationObserver.observe(source, {
      childList: true,
      subtree: options.subtree ?? true
    });
    if (includeExistingElements === true) {
      const treeWalker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
      while (treeWalker.nextNode()) {
        if (treeWalker.currentNode.matches(selector)) {
          this.send(treeWalker.currentNode);
        }
      }
    }
  }
  disconnect() {
    this.mutationObserver.disconnect();
    for (const callback of this.subscriptionSet) {
      this.subscriptionSet.delete(callback);
    }
  }
  subscribe(callback) {
    this.subscriptionSet.add(callback);
    let abort = false;
    for (const element of this.matchSet) {
      callback(element, () => {
        this.subscriptionSet.delete(callback);
        abort = true;
      });
      if (abort)
        return () => {};
    }
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  mutationObserver;
  matchSet = new Set;
  subscriptionSet = new Set;
  send(element) {
    if (!this.matchSet.has(element)) {
      this.matchSet.add(element);
      for (const callback of this.subscriptionSet) {
        callback(element, () => {
          this.subscriptionSet.delete(callback);
        });
      }
    }
  }
}

class ClassNodeReference {
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

// src/lib/ericchase/api.platform-web.ts
function WebPlatform_Node_Class_NodeReference(node) {
  return new ClassNodeReference(node);
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
    this.divMessages = WebPlatform_Node_Class_NodeReference(document.querySelector("#messages")).as(HTMLDivElement);
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
