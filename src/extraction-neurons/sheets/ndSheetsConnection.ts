import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// ND usa la misma credencial de servicio que el lector de Drive.
// Esto evita depender de Application Default Credentials (ADC) del usuario
// de Cloud Shell y, por lo tanto, evita errores de quota project.
const credentialsPath = path.join(process.cwd(), 'credentials.json');
if (!fs.existsSync(credentialsPath)) {
  throw new Error('No se encontró credentials.json en la raíz del proyecto');
}
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

export const sheets = google.sheets({ version: 'v4', auth });

let SPREADSHEET_ID = process.env.ND_GOOGLE_SHEETS_ID || '';
const ID_FILE = path.join(process.cwd(), 'checkpoints', 'ND_GOOGLE_SHEETS_ID');

function leerId(): string {
  try {
    return fs.existsSync(ID_FILE) ? fs.readFileSync(ID_FILE, 'utf8').trim() : '';
  } catch {
    return '';
  }
}

function guardarId(id: string): void {
  const d = path.dirname(ID_FILE);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(ID_FILE, id + '\n', 'utf8');
}

export async function prepararConexionSheetsND(): Promise<string> {
  if (SPREADSHEET_ID) {
    console.log(`   📊 ND -> Google Sheets existente: ${SPREADSHEET_ID}`);
    return SPREADSHEET_ID;
  }

  SPREADSHEET_ID = leerId();
  if (SPREADSHEET_ID) {
    console.log(`   📊 ND -> Google Sheets existente: ${SPREADSHEET_ID}`);
    return SPREADSHEET_ID;
  }

  const drive = google.drive({ version: 'v3', auth });
  const about = await drive.about.get({ fields: 'user(emailAddress)' });
  console.log(`   👤 ND Sheets autenticado como: ${about.data.user?.emailAddress || credentials.client_email}`);

  const creado = await sheets.spreadsheets.create({
    requestBody: { properties: { title: 'ARKON ND - Extracción' } },
  });
  const id = creado.data.spreadsheetId;
  if (!id) throw new Error('Google Sheets no devolvió spreadsheetId.');

  SPREADSHEET_ID = id;
  guardarId(id);
  console.log(`   🆕 Hoja ND creada: ${id}`);
  return id;
}

export function getNDSpreadsheetId(): string {
  if (!SPREADSHEET_ID) throw new Error('Sheets ND no preparado.');
  return SPREADSHEET_ID;
}
