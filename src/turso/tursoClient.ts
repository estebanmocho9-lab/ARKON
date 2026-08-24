import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

let turso: any;
try {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en el archivo .env');
  }

  turso = createClient({
    url,
    authToken,
  });
} catch {
  console.warn('[AI Studio] Turso not configured — using mock client');
  turso = {
    execute: async () => ({ rows: [] })
  };
}

export { turso };
