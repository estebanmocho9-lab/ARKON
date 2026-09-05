// ============================================================
// ARKON — CONEXION ND -> GOOGLE SHEETS
//
// ND usa la cuenta de usuario activa de gcloud en Cloud Shell para
// el DESTINO Sheets. No reutiliza credentials.json para crear hojas.
// credentials.json queda reservado al acceso de Drive/origen.
//
// Cada PDF recibe una spreadsheet independiente. No existe una
// spreadsheet global de ND ni un ID fijo de resultados.
// ============================================================

import { google } from 'googleapis';
import { execFileSync } from 'child_process';

/**
 * googleapis no acepta un objeto plano con getRequestHeaders() como
 * auth client: internamente necesita authClient.request().
 *
 * Extendemos OAuth2Client para conservar el request() real de
 * google-auth-library y obtenemos el token de la cuenta activa de
 * gcloud cada vez que Google necesita metadata de autenticacion.
 */
class GcloudUserAuth extends google.auth.OAuth2 {
  private token(): string {
    const token = execFileSync('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (!token) {
      throw new Error('gcloud no devolvió un access token para la cuenta activa.');
    }
    return token;
  }

  async getAccessToken(): Promise<{ token: string }> {
    return { token: this.token() };
  }

  async getRequestMetadataAsync(): Promise<any> {
    return {
      headers: {
        Authorization: `Bearer ${this.token()}`,
      },
    };
  }
}

export const sheetsAuth = new GcloudUserAuth();

export const sheets = google.sheets({ version: 'v4', auth: sheetsAuth });
export const drive = google.drive({ version: 'v3', auth: sheetsAuth });

let spreadsheetId = '';

export function setNDSpreadsheetId(id: string): void {
  spreadsheetId = id;
}

export function resetNDSpreadsheet(): void {
  spreadsheetId = '';
}

export function getNDSpreadsheetId(): string {
  if (!spreadsheetId) {
    throw new Error('Sheets ND no preparado para el documento actual.');
  }
  return spreadsheetId;
}

export async function prepararConexionSheetsND(): Promise<string> {
  return getNDSpreadsheetId();
}

export async function crearSpreadsheetND(nombreDocumento: string): Promise<string> {
  const about = await drive.about.get({ fields: 'user(emailAddress)' });
  const email = about.data.user?.emailAddress || 'cuenta de Google activa';
  console.log(`   👤 ND Sheets autenticado como: ${email}`);

  const safe = String(nombreDocumento)
    .replace(/[\/\\?*\[\]:]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150) || 'PDF';

  const creado = await sheets.spreadsheets.create({
    requestBody: { properties: { title: `ARKON_ND_${safe}` } },
  });

  const id = creado.data.spreadsheetId;
  if (!id) {
    throw new Error('Google Sheets no devolvió spreadsheetId al crear la hoja ND.');
  }

  setNDSpreadsheetId(id);
  console.log(`   🆕 Spreadsheet ND creada bajo la cuenta de usuario activa: ARKON_ND_${safe}`);
  console.log(`   🔗 Spreadsheet ID: ${id}`);
  return id;
}
