// ============================================
// IMPULSO IA — CONEXIÓN CON GOOGLE SHEETS
// ============================================

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

let sheets: any;
let SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || 'mock-sheet-id';

function normalizarPrivateKey(value: string): string {
  let key = value.trim();
  // Render puede recibir el valor copiado desde una salida JSON con comillas.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

function cargarCredenciales(): { client_email: string; private_key: string } {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
  if (json?.trim()) {
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no contiene client_email/private_key');
    return { client_email: String(parsed.client_email), private_key: normalizarPrivateKey(String(parsed.private_key)) };
  }

  // Aceptamos ambos nombres: GOOGLE_CLIENT_EMAIL (canónico) y
  // GOOGLE_SERVICE_ACCOUNT_EMAIL (el nombre que ya está configurado en Render).
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return { client_email: clientEmail.trim(), private_key: normalizarPrivateKey(privateKey) };
  }

  const credentialsPath = path.join(process.cwd(), 'credentials.json');
  if (fs.existsSync(credentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    if (!credentials.client_email || !credentials.private_key) throw new Error('credentials.json no contiene client_email/private_key');
    return { client_email: String(credentials.client_email), private_key: normalizarPrivateKey(String(credentials.private_key)) };
  }

  throw new Error('No hay credenciales de Google Sheets. Configure GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_CLIENT_EMAIL/GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.');
}

try {
  const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
  if (!SHEET_ID) throw new Error('Falta variable de entorno: GOOGLE_SHEETS_ID');
  const credentials = cargarCredenciales();
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: credentials.client_email, private_key: credentials.private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });
  sheets = google.sheets({ version: 'v4', auth });
  SPREADSHEET_ID = SHEET_ID;
  console.log('✅ Google Sheets conectado correctamente');
} catch (error: any) {
  console.warn(`⚠️ Google Sheets no configurado: ${error?.message || error}`);
  sheets = {
    spreadsheets: {
      values: {
        get: async () => ({ data: { values: [] } }),
        append: async () => ({ data: {} }),
        update: async () => ({ data: {} })
      },
      get: async () => ({ data: {} })
    }
  };
}

export { sheets, SPREADSHEET_ID };
