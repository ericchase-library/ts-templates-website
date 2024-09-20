// src/lib/ericchase/Utility/Console.ts
function ConsoleError(...items) {
  console['error'](...items);
}

// src/lib/ericchase/Web API/Node_Utility.ts
function NodeRef(node) {
  return new CNodeRef(node);
}
class CNodeRef {
  node;
  constructor(node) {
    if (node === null) {
      throw new ReferenceError('Reference is null.');
    }
    if (node === undefined) {
      throw new ReferenceError('Reference is undefined.');
    }
    this.node = node;
  }
  as(constructor_ref) {
    if (this.node instanceof constructor_ref) return this.node;
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

// src/index.bundle.ts
class Page {
  divMessages;
  constructor() {
    this.divMessages = NodeRef(document.querySelector('#messages')).as(HTMLDivElement);
  }
  addMessage(text) {
    try {
      const div = document.createElement('div');
      const pre = document.createElement('pre');
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
var page = new Page();

//# debugId=025850BD90AD035164756E2164756E21
//# sourceMappingURL=index.bundle.js.map
