// @bun
// src/lib/database/dbdriver-localhost.ts
function getLocalhost(address) {
  return {
    async query(text, params) {
      const response = await fetch(`${address}/database/query`, {
        method: "POST",
        body: JSON.stringify({ text, params })
      });
      if (response.status < 200 || response.status > 299) {
        throw await response.json();
      }
      return await response.json();
    }
  };
}

// src/lib/server/server.ts
var server_hostname = "127.0.0.1";
var server_port = "8000";
var server_http = `http://${server_hostname}:${server_port}`;
var server_ws = `ws://${server_hostname}:${server_port}`;

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

// src/lib/database/queries.module.ts
var db = getLocalhost(server_http);
async function DatabaseConnected() {
  const q = "SELECT 1";
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
      AND table_name = $1
    );
  `;
  const { exists } = (await db.query(q, [name]))[0];
  return exists ?? false;
}
async function EnsureTableExists(name) {
  try {
    if (await TableExists(name) === true) {
      return { created: false, exists: true };
    }
    await CreateTable(name);
    if (await TableExists(name) === true) {
      return { created: true, exists: true };
    }
  } catch (error) {
    ConsoleError(error);
  }
  return { created: false, exists: false };
}
export {
  TableExists,
  EnsureTableExists,
  DatabaseConnected,
  CreateTable
};
