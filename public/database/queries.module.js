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
  $marks = new Set();
  extra;
  constructor(extra) {
    this.extra = extra;
  }
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

// src/lib/ericchase/Utility/Console.ts
function ConsoleError(...items) {
  console['error'](...items);
  marker_manager.extra.newline_count = 0;
  marker_manager.updateMarkers();
}
var marker_manager = new UpdateMarkerManager({ newline_count: 0 });

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

//# debugId=3567FB8F4055408164756E2164756E21
//# sourceMappingURL=queries.module.js.map
