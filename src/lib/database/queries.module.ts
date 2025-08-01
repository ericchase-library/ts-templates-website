import { Core_Console_Error } from '../ericchase/Core_Console_Error.js';
import { SERVER_HOST } from '../server/constants.js';
import { getLocalhost } from './dbdriver-localhost.js';

// const db = DatabaseDriver.getNeon(<insert a valid connection string>);

//
//
// Note: Change this host string if needed. It should be automatically injected
// by the build tools.
const db = getLocalhost(`http://${SERVER_HOST}/`);

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
    Core_Console_Error(error);
  }
  return { created: false, exists: false };
}
