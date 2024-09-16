import { getLocalhost } from '../lib/database-drivers/dbdriver-localhost.js';
import { ConsoleError } from '../lib/ericchase/Utility/Console.js';
import { server_http } from '../server/server.js';

// const db = DatabaseDriver.getNeon(<insert a valid connection string>);
const db = getLocalhost(server_http);

//                                                                          \\
//
// Postgres Queries

export async function DatabaseConnected(): Promise<boolean> {
  const q = 'SELECT 1';
  await db.query(q, []);
  return true;
}

export async function CreateTable(name: string): Promise<void> {
  const q = `
      CREATE TABLE ${name} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `;
  await db.query(q, []);
}
export async function TableExists(name: string): Promise<boolean> {
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

//                                                                          \\
//
// Database Functions

export async function EnsureTableExists(name: string): Promise<{ created: boolean; exists: boolean }> {
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
