import { createClient, Client } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  throw new Error(
    'Turso no está configurado: faltan TURSO_DATABASE_URL y/o TURSO_AUTH_TOKEN en .env.'
  );
}

export const turso: Client = createClient({
  url,
  authToken,
});
