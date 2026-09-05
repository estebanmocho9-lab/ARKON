import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// ND crea una spreadsheet independiente por cada PDF.
// La misma cuenta de servicio que lee Drive crea y escribe el resultado.
const credentialsPath = path.join(process.cwd(), 'credentials.json');
if (!fs.existsSync(credentialsPath)) throw new Error('No se encontró credentials.json en la raíz del proyecto');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: credentials.client_email, private_key: credentials.private_key },
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
});

export const sheets = google.sheets({ version: 'v4', auth });
export const drive = google.drive({ version: 'v3', auth });

let spreadsheetId = '';

export function setNDSpreadsheetId(id: string): void { spreadsheetId = id; }
export function resetNDSpreadsheet(): void { spreadsheetId = ''; }
export function getNDSpreadsheetId(): string {
  if (!spreadsheetId) throw new Error('Sheets ND no preparado para el documento actual.');
  return spreadsheetId;
}

export async function prepararConexionSheetsND(): Promise<string> {
  return getNDSpreadsheetId();
}

export async function crearSpreadsheetND(nombreDocumento: string): Promise<string> {
  const requestBody: any = { properties: { title: `ARKON_ND_${nombreDocumento}` } };
  // Si se configura ND_SHEETS_FOLDER_ID, la spreadsheet se crea directamente
  // en esa carpeta de Drive (por ejemplo, una carpeta compartida de SM).
  const folderId = process.env.ND_SHEETS_FOLDER_ID?.trim();
  if (folderId) requestBody.parents = [folderId];

  const creado = await drive.files.create({
    requestBody: {
      name: requestBody.properties.title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      ...(folderId ? { parents: [folderId] } : {}),
    },
    fields: 'id,name,parents',
    supportsAllDrives: true,
  });
  const id = creado.data.id;
  if (!id) throw new Error('Google Drive no devolvió el ID de la spreadsheet ND.');
  setNDSpreadsheetId(id);
  console.log(`   🆕 Spreadsheet ND creada: ${creado.data.name || requestBody.properties.title}`);
  console.log(`   🔗 Spreadsheet ID: ${id}`);
  if (folderId) console.log(`   📁 Carpeta Sheets ND: ${folderId}`);
  return id;
}
