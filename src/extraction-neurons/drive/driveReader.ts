// ============================================================
// src/extraction-neurons/drive/driveReader.ts
// Lector de Google Drive, reutilizable por las 10 neuronas.
// ============================================================

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const credentialsPath = path.join(process.cwd(), 'credentials.json');
const rawEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
let credentials: any;

if (rawEnv) credentials = JSON.parse(rawEnv);
else if (fs.existsSync(credentialsPath)) credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
else throw new Error('No hay credenciales Google. Configure GOOGLE_SERVICE_ACCOUNT_JSON o credentials.json');

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: credentials.client_email, private_key: credentials.private_key },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

export interface ArchivoDrive { id: string; nombre: string; }

export function extraerIdCarpeta(urlOId: string): string {
  const valor = urlOId.trim();
  const match = valor.match(/(?:drive\/folders\/|folders\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : valor;
}

export async function resolverSubcarpetaPorNombre(carpetaMadreId: string, nombreSubcarpeta: string): Promise<string> {
  const carpetaMadreRealId = extraerIdCarpeta(carpetaMadreId);
  const nombreSeguro = nombreSubcarpeta.replace(/'/g, "\\'");
  const res: any = await drive.files.list({
    q: `'${carpetaMadreRealId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${nombreSeguro}' and trashed=false`,
    fields: 'files(id, name)', pageSize: 5,
  });
  const encontrada = (res.data.files || [])[0];
  if (!encontrada) throw new Error(`No se encontró la subcarpeta "${nombreSubcarpeta}" dentro de la carpeta madre. ID utilizado: ${carpetaMadreRealId}. Verificá que exista y esté compartida con la cuenta configurada.`);
  return encontrada.id;
}

export async function listarPDFs(carpetaId: string): Promise<ArchivoDrive[]> {
  const carpetaRealId = extraerIdCarpeta(carpetaId);
  const archivos: ArchivoDrive[] = [];
  let pageToken: string | undefined;
  do {
    const res: any = await drive.files.list({
      q: `'${carpetaRealId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'nextPageToken, files(id, name)', pageSize: 200, pageToken, orderBy: 'name',
    });
    for (const f of res.data.files || []) if (f.id && f.name) archivos.push({ id: f.id, nombre: f.name });
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return archivos;
}

export interface ArchivoDriveCompleto { id: string; nombre: string; mimeType: string; tamanoMB: number; }

export async function listarTodosLosArchivos(carpetaId: string): Promise<ArchivoDriveCompleto[]> {
  const carpetaRealId = extraerIdCarpeta(carpetaId);
  const archivos: ArchivoDriveCompleto[] = [];
  let pageToken: string | undefined;
  do {
    const res: any = await drive.files.list({
      q: `'${carpetaRealId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType, size)', pageSize: 200, pageToken, orderBy: 'name',
    });
    for (const f of res.data.files || []) if (f.id && f.name) archivos.push({ id: f.id, nombre: f.name, mimeType: f.mimeType || 'desconocido', tamanoMB: f.size ? Math.round((Number(f.size) / (1024 * 1024)) * 100) / 100 : 0 });
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return archivos;
}

export async function descargarArchivo(archivoId: string): Promise<Buffer> {
  const res: any = await drive.files.get({ fileId: archivoId, alt: 'media' }, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}

export const emailCuentaServicio = credentials.client_email as string;
