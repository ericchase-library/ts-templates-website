// src/index.bundle.ts
import { DatabaseDriver } from './database-drivers/dbdriver.module.js';

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

// src/server/server.ts
function EnableHotReload() {
  const socket = new WebSocket(server_ws);
  socket.addEventListener('message', (event) => {
    if (event.data === 'reload') {
      window.location.reload();
    }
  });
}
var host = '127.0.0.1';
var port = '8000';
var server_ws = `ws://${host}:${port}`;
var server_http = `http://${host}:${port}`;

// src/index.bundle.ts
async function DatabaseConnected() {
  const q = 'SELECT 1';
  await db_query(q, []);
  return true;
}
async function CreateTable(name) {
  const q = `
      CREATE TABLE ${name} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `;
  await db_query(q, []);
}
async function TableExists(name) {
  const q = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = \$1
    );
  `;
  const { exists } = (await db_query(q, [name]))[0];
  return exists ?? false;
}
async function EnsureTableExists(name) {
  try {
    if ((await TableExists(name)) === true) {
      return { created: false, exists: true };
    }
    await CreateTable(name);
    if ((await TableExists(name)) === true) {
      return { created: true, exists: true };
    }
  } catch (error) {
    ConsoleError(error);
  }
  return { created: false, exists: false };
}
EnableHotReload();
var db_query = DatabaseDriver.getLocalhost(server_http);

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
try {
  if (await DatabaseConnected()) {
    const tableName = 'test';
    const { created, exists } = await EnsureTableExists(tableName);
    if (created) {
      page.addMessage('Table created.');
    } else if (exists) {
      page.addMessage('Table exists.');
    } else {
      page.addMessage('Table creation failed.');
    }
  }
} catch (error) {
  page.addMessage(error);
  page.addMessage('Is server running? Check api endpoint.');
}

//# debugId=2DF844628A24AE1264756E2164756E21
//# sourceMappingURL=index.bundle.js.map
