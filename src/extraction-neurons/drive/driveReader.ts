// ============================================================
// src/extraction-neurons/drive/driveReader.ts
// Lector de Google Drive, reutilizable por las 10 neuronas.
// Reutiliza las MISMAS credenciales que ya usa tu proyecto para
// Sheets (credentials.json, cuenta de servicio) — no se crea
// una conexión nueva desde cero, se reaprovecha la existente.
// ============================================================

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

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
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

export interface ArchivoDrive {
  id: string;
  nombre: string;
}

// ── Extrae el ID de carpeta de una URL de Drive, o lo devuelve
//    tal cual si ya era un ID ──────────────────────────────────
export function extraerIdCarpeta(urlOId: string): string {
  const match = urlOId.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : urlOId.trim();
}

// ── Busca una subcarpeta por nombre exacto dentro de una carpeta
//    madre (ej. resolver "01" dentro de "ImpulsoIA - Biblioteca
//    Técnica"), para no depender de tener los 10 IDs a mano ─────
export async function resolverSubcarpetaPorNombre(
  carpetaMadreId: string,
  nombreSubcarpeta: string
): Promise<string> {
  const res: any = await drive.files.list({
    q: `'${carpetaMadreId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${nombreSubcarpeta}' and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 5,
  });

  const encontrada = (res.data.files || [])[0];
  if (!encontrada) {
    throw new Error(
      `No se encontró la subcarpeta "${nombreSubcarpeta}" dentro de la carpeta madre. ` +
      `Verificá que exista y que esté compartida con: ${credentials.client_email}`
    );
  }
  return encontrada.id;
}

// ── Lista todos los PDFs dentro de una carpeta de Drive ─────────
export async function listarPDFs(carpetaId: string): Promise<ArchivoDrive[]> {
  const archivos: ArchivoDrive[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const res: any = await drive.files.list({
      q: `'${carpetaId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'nextPageToken, files(id, name)',
      pageSize: 200,
      pageToken,
      orderBy: 'name',
    });

    for (const f of res.data.files || []) {
      if (f.id && f.name) archivos.push({ id: f.id, nombre: f.name });
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return archivos;
}

// ── Descarga un archivo puntual a memoria (Buffer), sin dejar
//    copia en disco ─────────────────────────────────────────────
export async function descargarArchivo(archivoId: string): Promise<Buffer> {
  const res: any = await drive.files.get(
    { fileId: archivoId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

export const emailCuentaServicio = credentials.client_email as string;
