// ============================================================
// ARKON — CONEXION ND -> GOOGLE SHEETS
//
// ND usa las credenciales de usuario disponibles como ADC en
// Cloud Shell. No reutiliza el service account de credentials.json
// usado por el lector de Drive/NE.
//
// Si ND_GOOGLE_SHEETS_ID existe, se usa esa hoja.
// Si no existe, se crea una hoja nueva una sola vez y se guarda
// su ID en checkpoints/ND_GOOGLE_SHEETS_ID.
// ============================================================

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

export const sheetsAuth = new google.auth.GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

export const sheets = google.sheets({ version: 'v4', auth: sheetsAuth });

let SPREADSHEET_ID = process.env.ND_GOOGLE_SHEETS_ID || '';

const ID_FILE = path.join(process.cwd(), 'checkpoints', 'ND_GOOGLE_SHEETS_ID');

function leerIdPersistido(): string {
  try {
    if (fs.existsSync(ID_FILE)) {
      const id = fs.readFileSync(ID_FILE, 'utf8').trim();
      if (id) return id;
    }
  } catch {
    // Se vuelve a crear si no se puede leer el checkpoint.
  }
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

  // Valida que las credenciales de usuario puedan acceder a Drive.
  const drive = google.drive({ version: 'v3', auth: sheetsAuth });
  const about = await drive.about.get({ fields: 'user(emailAddress)' });
  const email = about.data.user?.emailAddress || 'cuenta de Google autenticada';
  console.log(`   👤 ND Sheets autenticado como: ${email}`);

  const creado = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'ARKON ND - Extracción',
      },
    },
  });

  const id = creado.data.spreadsheetId;
  if (!id) throw new Error('Google Sheets no devolvió spreadsheetId al crear la hoja ND.');

  SPREADSHEET_ID = id;
  guardarIdPersistido(id);

  console.log(`   🆕 Hoja ND creada: https://docs.google.com/spreadsheets/d/${id}/edit`);
  return id;
}

export function getNDSpreadsheetId(): string {
  if (!SPREADSHEET_ID) {
    throw new Error('La conexión ND de Google Sheets todavía no fue preparada.');
  }
  return SPREADSHEET_ID;
}
