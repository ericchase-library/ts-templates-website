import { server_http, server_ws } from './server.js';

import { DatabaseDriver } from './database-drivers/dbdriver.module.js';
import { ConsoleError } from './lib/ericchase/Utility/Console.js';
import { NodeRef } from './lib/ericchase/Web API/Node_Utility.js';

//                                                                          \\
//
// Hot Reload

const socket = new WebSocket(server_ws);
socket.addEventListener('message', (event) => {
  if (event.data === 'reload') {
    window.location.reload();
  }
});

//                                                                          \\
//
// Postgres Queries

const db_query = DatabaseDriver.getLocalhost(server_http);

async function DatabaseConnected(): Promise<boolean> {
  try {
    const q = `SELECT 1`;
    await db_query(q, []);
    return true;
  } catch (error) {
    throw error;
  }
}

async function CreateTable(name: string): Promise<void> {
  const q = `
      CREATE TABLE ${name} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `;
  await db_query(q, []);
}
async function TableExists(name: string): Promise<boolean> {
  const q = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  const { exists } = (await db_query(q, [name]))[0];
  return exists ?? false;
}

//                                                                          \\
//
// Database Functions

async function EnsureTableExists(name: string): Promise<{ created: boolean; exists: boolean }> {
  try {
    if ((await TableExists(name)) === true) {
      return { created: false, exists: true };
    } else {
      await CreateTable(name);
      if ((await TableExists(name)) === true) {
        return { created: true, exists: true };
      }
    }
  } catch (error) {
    ConsoleError(error);
  }
  return { created: false, exists: false };
}

//                                                                          \\

class Page {
  divMessages: HTMLDivElement;
  constructor() {
    this.divMessages = NodeRef(document.querySelector('#messages')).as(HTMLDivElement);
  }
  addMessage(text: string) {
    try {
      const div = document.createElement('div');
      const pre = document.createElement('pre');
      pre.textContent = text;
      div.appendChild(pre);
      this.divMessages.prepend(div);
      // scroll div into view
      div.scrollIntoView(false);
      return div;
    } catch (error) {
      ConsoleError(error);
    }
  }
}

const page = new Page();

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
} catch (error: any) {
  page.addMessage(error);
  page.addMessage('Is server running? Check api endpoint.');
}
