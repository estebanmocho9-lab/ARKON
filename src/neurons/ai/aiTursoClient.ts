import { createClient, Client } from '@libsql/client';

let client: Client | null = null;

/**
 * Dedicated connection for the new Turso library used only by AI-neuron
 * evidence retrieval. It intentionally does not fall back to the extractor's
 * TURSO_DATABASE_URL/TURSO_AUTH_TOKEN, keeping those database accounts separate.
 */
export function getAINeuronTursoClient(): Client | null {
  const url = process.env.ARKON_AI_TURSO_DATABASE_URL?.trim();
  const authToken = process.env.ARKON_AI_TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken) return null;
  if (!client) client = createClient({ url, authToken });
  return client;
}
