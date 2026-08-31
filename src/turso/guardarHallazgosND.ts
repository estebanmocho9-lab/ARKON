// ============================================================
// Persistencia de la extraccion ND.
// Guarda el hallazgo completo y su evidencia sin obligarlo a
// pertenecer todavia a una propiedad/neurona cientifica.
// La tabla es idempotente y tolera reintentos de un documento.
// ============================================================

import { turso } from './tursoClient';
import { HallazgoND } from '../extraction-neurons/memoria-nd/tipos';

let preparada = false;

async function prepararTabla(): Promise<void> {
  if (preparada) return;
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS nd_hallazgos_raw (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      neuron_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      campo TEXT,
      texto_original TEXT NOT NULL,
      texto_normalizado TEXT NOT NULL,
      entidad_candidata TEXT,
      valor REAL,
      valor_texto TEXT,
      unidad TEXT,
      simbolo TEXT,
      contexto TEXT NOT NULL,
      idioma TEXT NOT NULL,
      confianza REAL NOT NULL,
      evidencia_json TEXT NOT NULL,
      metadatos_json TEXT,
      documento_drive_id TEXT,
      pagina INTEGER,
      posicion_inicio INTEGER,
      posicion_fin INTEGER,
      seccion TEXT,
      clave_unica TEXT,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Compatibilidad con una tabla creada por una version anterior.
  for (const sql of [
    `ALTER TABLE nd_hallazgos_raw ADD COLUMN documento_drive_id TEXT`,
    `ALTER TABLE nd_hallazgos_raw ADD COLUMN pagina INTEGER`,
    `ALTER TABLE nd_hallazgos_raw ADD COLUMN posicion_inicio INTEGER`,
    `ALTER TABLE nd_hallazgos_raw ADD COLUMN posicion_fin INTEGER`,
    `ALTER TABLE nd_hallazgos_raw ADD COLUMN seccion TEXT`,
    `ALTER TABLE nd_hallazgos_raw ADD COLUMN clave_unica TEXT`,
  ]) {
    try { await turso.execute(sql); } catch { /* columna ya existente */ }
  }

  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_neuron ON nd_hallazgos_raw(neuron_id)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_tipo ON nd_hallazgos_raw(tipo)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_doc ON nd_hallazgos_raw(documento_drive_id)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_prop ON nd_hallazgos_raw(entidad_candidata)`);
  await turso.execute(`CREATE UNIQUE INDEX IF NOT EXISTS uq_nd_hallazgos_clave ON nd_hallazgos_raw(clave_unica)`);
  preparada = true;
}

function claveUnica(h: HallazgoND): string {
  const e = h.evidencia;
  const driveId = String(h.metadatos?.documentoDriveId || e.documento);
  return [
    h.neuronId,
    driveId,
    e.pagina,
    h.tipo,
    h.campo || '',
    e.posicionInicio ?? '',
    e.posicionFin ?? '',
    h.textoNormalizado,
  ].join('¦');
}

export async function guardarHallazgosND(hallazgos: HallazgoND[]): Promise<void> {
  if (!hallazgos.length) return;
  await prepararTabla();

  for (const h of hallazgos) {
    const e = h.evidencia;
    const clave = claveUnica(h);
    await turso.execute({
      sql: `INSERT OR IGNORE INTO nd_hallazgos_raw
        (neuron_id, tipo, campo, texto_original, texto_normalizado,
         entidad_candidata, valor, valor_texto, unidad, simbolo,
         contexto, idioma, confianza, evidencia_json, metadatos_json,
         documento_drive_id, pagina, posicion_inicio, posicion_fin, seccion, clave_unica)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        h.neuronId,
        h.tipo,
        h.campo || null,
        h.textoOriginal,
        h.textoNormalizado,
        h.entidadCandidata || null,
        h.valor ?? null,
        h.valorTexto || null,
        h.unidad || null,
        h.simbolo || null,
        h.contexto,
        h.idioma,
        h.confianza,
        JSON.stringify(h.evidencia),
        h.metadatos ? JSON.stringify(h.metadatos) : null,
        h.metadatos?.documentoDriveId || null,
        e.pagina,
        e.posicionInicio ?? null,
        e.posicionFin ?? null,
        e.seccion || null,
        clave,
      ],
    });
  }
}
