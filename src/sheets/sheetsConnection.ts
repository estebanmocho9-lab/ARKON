// ============================================
// IMPULSO IA — CONEXIÓN CON GOOGLE SHEETS
// ============================================

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

if (!SHEET_ID) {
  throw new Error('Falta variable de entorno: GOOGLE_SHEETS_ID');
}

// Leer credenciales directo del archivo JSON
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
export const SPREADSHEET_ID = SHEET_ID;

console.log('✅ Google Sheets conectado correctamente');