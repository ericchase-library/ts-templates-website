// src/lib/database-drivers/dbdriver-localhost.ts
function getLocalhost(address) {
  return {
    async query(text, params) {
      const response = await fetch(`${address}/database/query`, {
        method: 'POST',
        body: JSON.stringify({ text, params }),
      });
      if (response.status < 200 || response.status > 299) {
        throw await response.json();
      }
      return await response.json();
    },
  };
}

// src/lib/ericchase/Utility/Console.ts
function updateMarks() {
  for (const mark of Console.marks) {
    Console.marks.delete(mark);
    mark.updated = true;
  }
}
function ConsoleError(...items) {
  console['error'](...items);
  Console.newline_count = 0;
  updateMarks();
}
var Console;
((Console) => {
  Console.newline_count = 0;
  Console.marks = new Set();
})((Console ||= {}));

// src/dev_server/server-data.ts
var host = '127.0.0.1';
var port = '8000';
var server_ws = `ws://${host}:${port}`;
var server_http = `http://${host}:${port}`;

// src/database/queries.module.ts
async function DatabaseConnected() {
  const q = 'SELECT 1';
  await db.query(q, []);
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
  await db.query(q, []);
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
  const { exists } = (await db.query(q, [name]))[0];
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
var db = getLocalhost(server_http);
export { TableExists, EnsureTableExists, DatabaseConnected, CreateTable };

//# debugId=4C31AC807B0253E164756E2164756E21
//# sourceMappingURL=queries.module.js.map
