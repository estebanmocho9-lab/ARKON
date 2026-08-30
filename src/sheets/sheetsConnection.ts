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

function cargarCredenciales(): { client_email: string; private_key: string } {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_CREDENTIALS_JSON;
  if (json?.trim()) {
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no contiene client_email/private_key');
    return { client_email: String(parsed.client_email), private_key: String(parsed.private_key).replace(/\\n/g, '\n') };
  }
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (clientEmail && privateKey) return { client_email: clientEmail, private_key: privateKey.replace(/\\n/g, '\n') };
  const credentialsPath = path.join(process.cwd(), 'credentials.json');
  if (fs.existsSync(credentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    if (!credentials.client_email || !credentials.private_key) throw new Error('credentials.json no contiene client_email/private_key');
    return { client_email: String(credentials.client_email), private_key: String(credentials.private_key).replace(/\\n/g, '\n') };
  }
  throw new Error('No hay credenciales de Google Sheets. Configure GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY.');
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