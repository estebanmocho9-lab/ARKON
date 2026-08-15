import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    'Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en el archivo .env'
  );
}

export const turso = createClient({
  url,
  authToken,
});
