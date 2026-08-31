// ============================================================
// Persistencia de la extraccion ND.
// Guarda el hallazgo completo y su evidencia sin obligarlo a
// pertenecer todavia a una propiedad/neurona cientifica.
// La tabla se crea de forma idempotente en Turso.
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
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_neuron ON nd_hallazgos_raw(neuron_id)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_tipo ON nd_hallazgos_raw(tipo)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_nd_hallazgos_doc ON nd_hallazgos_raw(json_extract(evidencia_json, '$.documento'))`);
  preparada = true;
}

export async function guardarHallazgosND(hallazgos: HallazgoND[]): Promise<void> {
  if (!hallazgos.length) return;
  await prepararTabla();

  for (const h of hallazgos) {
    await turso.execute({
      sql: `INSERT INTO nd_hallazgos_raw
        (neuron_id, tipo, campo, texto_original, texto_normalizado,
         entidad_candidata, valor, valor_texto, unidad, simbolo,
         contexto, idioma, confianza, evidencia_json, metadatos_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ],
    });
  }
}
