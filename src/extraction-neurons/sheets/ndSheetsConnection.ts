// ============================================================
// ARKON — CONEXION ND -> GOOGLE SHEETS
//
// ND usa la cuenta de usuario activa de gcloud en Cloud Shell para
// el DESTINO Sheets. No reutiliza credentials.json (que pertenece
// al lector de Drive/NE y al origen de los PDFs).
// ============================================================

import { google } from 'googleapis';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const sheetsAuth: any = {
  async getRequestHeaders() {
    const token = execFileSync('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (!token) throw new Error('gcloud no devolvió un access token para la cuenta activa.');
    return { Authorization: `Bearer ${token}` };
  },
  async getRequestMetadata() { return this.getRequestHeaders(); },
};

export const sheets = google.sheets({ version: 'v4', auth: sheetsAuth });

let SPREADSHEET_ID = process.env.ND_GOOGLE_SHEETS_ID || '';
const ID_FILE = path.join(process.cwd(), 'checkpoints', 'ND_GOOGLE_SHEETS_ID');

function leerIdPersistido(): string {
  try { if (fs.existsSync(ID_FILE)) return fs.readFileSync(ID_FILE, 'utf8').trim(); } catch {}
  return '';
}

function guardarIdPersistido(id: string): void {
  const dir = path.dirname(ID_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ID_FILE, id + '\n', 'utf8');
}

export async function prepararConexionSheetsND(): Promise<string> {
  if (SPREADSHEET_ID) return SPREADSHEET_ID;
  SPREADSHEET_ID = leerIdPersistido();
  if (SPREADSHEET_ID) {
    console.log(`   📊 ND -> Google Sheets existente: ${SPREADSHEET_ID}`);
    return SPREADSHEET_ID;
  }

  const drive = google.drive({ version: 'v3', auth: sheetsAuth });
  const about = await drive.about.get({ fields: 'user(emailAddress)' });
  const email = about.data.user?.emailAddress || 'cuenta de Google activa';
  console.log(`   👤 ND Sheets autenticado como: ${email}`);

  const creado = await sheets.spreadsheets.create({
    requestBody: { properties: { title: 'ARKON ND - Extracción' } },
  });
  const id = creado.data.spreadsheetId;
  if (!id) throw new Error('Google Sheets no devolvió spreadsheetId al crear la hoja ND.');

  SPREADSHEET_ID = id;
  guardarIdPersistido(id);
  console.log(`   🆕 Hoja ND creada: https://docs.google.com/spreadsheets/d/${id}/edit`);
  return id;
}

export function getNDSpreadsheetId(): string {
  if (!SPREADSHEET_ID) throw new Error('La conexión ND de Google Sheets todavía no fue preparada.');
  return SPREADSHEET_ID;
}
