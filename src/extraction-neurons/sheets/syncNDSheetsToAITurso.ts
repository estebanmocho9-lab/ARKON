/**
 * Mirrors the current ND Google Sheet into the dedicated read-only AI Turso.
 * ND extraction remains Sheets-first; this is an explicit post-extraction sync.
 */
import * as dotenv from 'dotenv';
dotenv.config();
import { getAINeuronTursoClient } from '../../neurons/ai/aiTursoClient';
import { prepararSheetsND, sheets } from './ndSheetsPersistence';
import { getNDSpreadsheetId } from './ndSheetsConnection';

const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS nd_hallazgos_raw (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  neuron_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  campo TEXT,
  texto_original TEXT NOT NULL,
  texto_normalizado TEXT NOT NULL,
  entidad_candidata TEXT,
  entidad_principal TEXT,
  aspecto TEXT,
  dato_documental TEXT,
  valor REAL,
  valor_texto TEXT,
  unidad TEXT,
  simbolo TEXT,
  relacion_entidad TEXT,
  contexto TEXT NOT NULL DEFAULT '',
  idioma TEXT NOT NULL DEFAULT 'mixto',
  confianza REAL NOT NULL DEFAULT 0,
  evidencia_json TEXT NOT NULL,
  metadatos_json TEXT,
  documento_drive_id TEXT,
  pagina INTEGER,
  posicion_inicio INTEGER,
  posicion_fin INTEGER,
  seccion TEXT,
  clave_unica TEXT UNIQUE,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS nd_entidades_documentales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  documento_drive_id TEXT NOT NULL,
  neuron_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  entidad TEXT NOT NULL,
  clave_entidad TEXT NOT NULL UNIQUE,
  primera_pagina INTEGER,
  ultima_pagina INTEGER,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS nd_datos_entidad (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave_unica TEXT NOT NULL UNIQUE,
  clave_entidad TEXT NOT NULL,
  documento_drive_id TEXT NOT NULL,
  pagina INTEGER,
  aspecto TEXT,
  dato_documental TEXT NOT NULL,
  valor REAL,
  valor_texto TEXT,
  unidad TEXT,
  relacion_entidad TEXT,
  evidencia_json TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_nd_raw_doc ON nd_hallazgos_raw(documento_drive_id);
CREATE INDEX IF NOT EXISTS idx_ai_nd_raw_entity ON nd_hallazgos_raw(entidad_principal);
CREATE INDEX IF NOT EXISTS idx_ai_nd_raw_property ON nd_hallazgos_raw(aspecto);
CREATE INDEX IF NOT EXISTS idx_ai_nd_data_entity ON nd_datos_entidad(clave_entidad);
`;

const COLUMNS = [
  'clave_unica','documento_drive_id','documento','neuron_id','carpeta_drive','pagina',
  'tipo','campo','entidad_candidata','entidad_principal','aspecto','dato_documental',
  'texto_original','texto_normalizado','valor','valor_texto','unidad','simbolo',
  'relacion_entidad','contexto','idioma','confianza','evidencia_json','metadatos_json','timestamp',
];

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
function stringOrNull(value: unknown): string | null {
  const s = String(value ?? '').trim();
  return s || null;
}
function parseJson(value: unknown): Record<string, any> {
  if (typeof value !== 'string' || !value.trim()) return {};
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : {}; }
  catch { return {}; }
}

async function main() {
  const target = getAINeuronTursoClient();
  if (!target) throw new Error('Faltan ARKON_AI_TURSO_DATABASE_URL y ARKON_AI_TURSO_AUTH_TOKEN.');
  await prepararSheetsND();
  const spreadsheetId = getNDSpreadsheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'ND_HALLAZGOS!A:Y',
  });
  const rows = (response.data.values ?? []) as unknown[][];
  if (rows.length < 2) {
    console.log('ND_HALLAZGOS no contiene registros para sincronizar.');
    return;
  }

  const headers = (rows[0] ?? []).map(String);
  const indexes = new Map(headers.map((header, index) => [header, index]));
  for (const required of COLUMNS) {
    if (!indexes.has(required)) throw new Error(`Falta la columna ${required} en ND_HALLAZGOS.`);
  }

  await target.executeMultiple(TABLES_SQL);
  let synced = 0;
  const batchSize = 50;
  const dataRows = rows.slice(1).filter(row => row.some(value => String(value ?? '').trim() !== ''));

  for (let offset = 0; offset < dataRows.length; offset += batchSize) {
    const chunk = dataRows.slice(offset, offset + batchSize);
    for (const row of chunk) {
      const get = (key: string) => row[indexes.get(key)!];
      const evidence = parseJson(get('evidencia_json'));
      const metadata = parseJson(get('metadatos_json'));
      const documentName = stringOrNull(get('documento'));
      const page = numberOrNull(get('pagina'));
      const excerpt = stringOrNull(get('dato_documental')) || stringOrNull(get('texto_original')) || '';
      const evidenceJson = JSON.stringify({
        ...evidence,
        documento: evidence.documento || documentName,
        pagina: evidence.pagina ?? page,
        fragmento: evidence.fragmento || evidence.excerpt || excerpt,
      });
      const metadataJson = JSON.stringify({
        ...metadata,
        documentoDriveId: metadata.documentoDriveId || stringOrNull(get('documento_drive_id')),
        carpetaDrive: metadata.carpetaDrive || stringOrNull(get('carpeta_drive')),
        persistencia: 'google_sheets_mirrored_to_ai_turso',
      });
      const args = [
        stringOrNull(get('neuron_id')) || 'ND-UNKNOWN',
        stringOrNull(get('tipo')) || 'DESCONOCIDO',
        stringOrNull(get('campo')),
        stringOrNull(get('texto_original')) || excerpt,
        stringOrNull(get('texto_normalizado')) || excerpt.toLowerCase(),
        stringOrNull(get('entidad_candidata')),
        stringOrNull(get('entidad_principal')),
        stringOrNull(get('aspecto')),
        stringOrNull(get('dato_documental')),
        numberOrNull(get('valor')),
        stringOrNull(get('valor_texto')),
        stringOrNull(get('unidad')),
        stringOrNull(get('simbolo')),
        stringOrNull(get('relacion_entidad')),
        stringOrNull(get('contexto')) || '',
        stringOrNull(get('idioma')) || 'mixto',
        numberOrNull(get('confianza')) ?? 0,
        evidenceJson,
        metadataJson,
        stringOrNull(get('documento_drive_id')),
        page,
        numberOrNull(evidence.posicionInicio),
        numberOrNull(evidence.posicionFin),
        stringOrNull(evidence.seccion),
        stringOrNull(get('clave_unica')) || `nd-sheet:${offset + synced}`,
        stringOrNull(get('timestamp')) || new Date().toISOString(),
      ];
      await target.execute({
        sql: `INSERT INTO nd_hallazgos_raw (
          neuron_id,tipo,campo,texto_original,texto_normalizado,entidad_candidata,
          entidad_principal,aspecto,dato_documental,valor,valor_texto,unidad,simbolo,
          relacion_entidad,contexto,idioma,confianza,evidencia_json,metadatos_json,
          documento_drive_id,pagina,posicion_inicio,posicion_fin,seccion,clave_unica,creado_en
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(clave_unica) DO UPDATE SET
          neuron_id=excluded.neuron_id,tipo=excluded.tipo,campo=excluded.campo,
          texto_original=excluded.texto_original,texto_normalizado=excluded.texto_normalizado,
          entidad_candidata=excluded.entidad_candidata,entidad_principal=excluded.entidad_principal,
          aspecto=excluded.aspecto,dato_documental=excluded.dato_documental,valor=excluded.valor,
          valor_texto=excluded.valor_texto,unidad=excluded.unidad,simbolo=excluded.simbolo,
          relacion_entidad=excluded.relacion_entidad,contexto=excluded.contexto,idioma=excluded.idioma,
          confianza=excluded.confianza,evidencia_json=excluded.evidencia_json,metadatos_json=excluded.metadatos_json,
          documento_drive_id=excluded.documento_drive_id,pagina=excluded.pagina,
          posicion_inicio=excluded.posicion_inicio,posicion_fin=excluded.posicion_fin,seccion=excluded.seccion,
          creado_en=excluded.creado_en`,
        args,
      });
      synced++;
    }
    console.log(`   Turso IA: ${Math.min(offset + batchSize, dataRows.length)}/${dataRows.length} filas procesadas`);
  }

  console.log(`\nSincronización ND -> Turso IA finalizada: ${synced} hallazgos procesados.`);
  console.log('La cuenta original de extracción no se modifica; Turso IA recibe una copia de lectura.');
}

main().catch(error => {
  console.error('Error sincronizando ND con Turso IA:', error instanceof Error ? error.message : error);
  process.exit(1);
});
